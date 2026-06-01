import { prisma } from '../utils/prisma.js';
import { BaseRepository } from './BaseRepository.js';

export class TransactionRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.transaction as any, 'transaction');
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<any | null> {
    return prisma.transaction.findFirst({
      where: { invoiceNumber, deletedAt: null },
      include: {
        items: true,
        payments: true,
        customer: true,
        user: { include: { role: true } },
      },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, params?: { page?: number; limit?: number }): Promise<{ data: any[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          items: true,
          customer: true,
          user: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  }

  async getSalesSummary(startDate: Date, endDate: Date): Promise<any> {
    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      averageTransaction,
    };
  }

  async getBestSellingProducts(limit = 10, startDate?: Date, endDate?: Date): Promise<any[]> {
    const where: Record<string, unknown> = {
      transaction: {
        deletedAt: null,
        status: 'COMPLETED',
      },
    };

    if (startDate || endDate) {
      where.transaction = {
        ...(where.transaction as Record<string, unknown>),
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      };
    }

    const items = await prisma.transactionItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, subtotal: true },
      where,
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    return items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: item._sum.quantity || 0,
      totalRevenue: item._sum.subtotal || 0,
    }));
  }

  async getDailyRevenue(date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.transaction.aggregate({
      _sum: { total: true },
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    return result._sum.total || 0;
  }

  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await prisma.transaction.aggregate({
      _sum: { total: true },
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    return result._sum.total || 0;
  }

  async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-`;

    const lastTransaction = await prisma.transaction.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let nextNumber = 1;
    if (lastTransaction) {
      const parts = lastTransaction.invoiceNumber.split('-');
      nextNumber = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }
}
