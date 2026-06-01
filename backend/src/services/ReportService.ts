import { prisma } from '../utils/prisma.js';
import { TransactionRepository } from '../repositories/TransactionRepository.js';
import { ApiError } from '../utils/ApiError.js';

const transactionRepository = new TransactionRepository();

export class ReportService {
  async getDailySales(date: string) {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        items: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const summary = await transactionRepository.getSalesSummary(startOfDay, endOfDay);

    return {
      date,
      ...summary,
      transactions,
      transactionsByHour: this.groupByHour(transactions),
    };
  }

  async getWeeklySales(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    const summary = await transactionRepository.getSalesSummary(start, end);

    const dailyBreakdown: Record<string, { revenue: number; count: number }> = {};
    for (const t of transactions) {
      const day = t.createdAt.toISOString().split('T')[0];
      if (!dailyBreakdown[day]) {
        dailyBreakdown[day] = { revenue: 0, count: 0 };
      }
      dailyBreakdown[day].revenue += t.total;
      dailyBreakdown[day].count += 1;
    }

    return {
      startDate,
      endDate,
      ...summary,
      dailyBreakdown,
    };
  }

  async getMonthlySales(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    const summary = await transactionRepository.getSalesSummary(startOfMonth, endOfMonth);

    const weeklyBreakdown: Record<string, { revenue: number; count: number }> = {};
    for (const t of transactions) {
      const week = this.getWeekNumber(t.createdAt);
      const key = `Week ${week}`;
      if (!weeklyBreakdown[key]) {
        weeklyBreakdown[key] = { revenue: 0, count: 0 };
      }
      weeklyBreakdown[key].revenue += t.total;
      weeklyBreakdown[key].count += 1;
    }

    const bestSelling = await transactionRepository.getBestSellingProducts(10, startOfMonth, endOfMonth);

    return {
      year,
      month,
      monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
      ...summary,
      weeklyBreakdown,
      bestSelling,
    };
  }

  async getProductSales(productId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = { productId };

    if (startDate || endDate) {
      where.transaction = {
        deletedAt: null,
        status: 'COMPLETED',
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      };
    }

    const items = await prisma.transactionItem.findMany({
      where,
      include: {
        transaction: {
          select: { id: true, invoiceNumber: true, createdAt: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = items.reduce((sum, item) => sum + item.subtotal, 0);

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { category: true },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category.name,
      },
      totalQuantity,
      totalRevenue,
      transactions: items,
    };
  }

  async exportCSV(type: string, params: any): Promise<string> {
    let data: any[] = [];

    switch (type) {
      case 'transactions': {
        const result = await this.getFilteredTransactions(params);
        data = result.map((t: any) => ({
          'Invoice Number': t.invoiceNumber,
          'Date': t.createdAt.toISOString(),
          'Subtotal': t.subtotal,
          'Discount': t.discount,
          'Tax': t.tax,
          'Total': t.total,
          'Payment Method': t.paymentMethod,
          'Status': t.status,
          'Cashier': t.user?.name || '',
          'Customer': t.customer?.name || '',
        }));
        break;
      }
      case 'products': {
        const products = await prisma.product.findMany({
          where: { deletedAt: null },
          include: { category: true },
        });
        data = products.map((p) => ({
          'SKU': p.sku,
          'Barcode': p.barcode,
          'Name': p.name,
          'Category': p.category.name,
          'Price': p.price,
          'Cost': p.cost,
          'Stock': p.stock,
        }));
        break;
      }
      case 'sales': {
        const start = params.startDate ? new Date(params.startDate) : new Date(new Date().setDate(1));
        const end = params.endDate ? new Date(params.endDate) : new Date();
        const summary = await transactionRepository.getSalesSummary(start, end);
        data = [{
          'Start Date': start.toISOString(),
          'End Date': end.toISOString(),
          'Total Revenue': summary.totalRevenue,
          'Total Transactions': summary.totalTransactions,
          'Total Items': summary.totalItems,
          'Average Transaction': summary.averageTransaction,
        }];
        break;
      }
      default:
        throw ApiError.badRequest('Invalid export type');
    }

    if (data.length === 0) {
      return 'No data available';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          const escaped = String(value ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  async exportExcel(type: string, params: any): Promise<any> {
    const csvData = await this.exportCSV(type, params);

    return {
      type,
      data: csvData,
      format: 'csv',
      message: 'Use CSV data. For Excel format, use a library like exceljs on the frontend.',
      generatedAt: new Date().toISOString(),
    };
  }

  private async getFilteredTransactions(params: any): Promise<any[]> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (params.status) where.status = params.status;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt = { ...(where.createdAt as object), gte: new Date(params.startDate) };
      if (params.endDate) where.createdAt = { ...(where.createdAt as object), lte: new Date(params.endDate) };
    }

    return prisma.transaction.findMany({
      where,
      include: {
        user: { select: { name: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private groupByHour(transactions: any[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      result[`${String(i).padStart(2, '0')}:00`] = 0;
    }

    for (const t of transactions) {
      const hour = `${String(t.createdAt.getHours()).padStart(2, '0')}:00`;
      result[hour] = (result[hour] || 0) + t.total;
    }

    return result;
  }

  private getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }
}
