import { prisma } from '../utils/prisma.js';
import { TransactionRepository } from '../repositories/TransactionRepository.js';

const transactionRepository = new TransactionRepository();

export class DashboardService {
  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProducts,
      totalTransactions,
      revenueToday,
      revenueThisMonth,
      totalCustomers,
      totalCategories,
      pendingTransactions,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.transaction.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
      transactionRepository.getDailyRevenue(now),
      transactionRepository.getMonthlyRevenue(now.getFullYear(), now.getMonth() + 1),
      prisma.customer.count({ where: { deletedAt: null, isActive: true } }),
      prisma.category.count({ where: { deletedAt: null, isActive: true } }),
      prisma.transaction.count({ where: { deletedAt: null, status: 'PENDING' } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true, stock: { lte: 10 } } }),
    ]);

    return {
      totalProducts,
      totalTransactions,
      revenueToday,
      revenueThisMonth,
      totalCustomers,
      totalCategories,
      pendingTransactions,
      lowStockProducts,
    };
  }

  async getBestSellingProducts(limit = 10) {
    return transactionRepository.getBestSellingProducts(limit);
  }

  async getRecentTransactions(limit = 10) {
    return prisma.transaction.findMany({
      where: { deletedAt: null },
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
