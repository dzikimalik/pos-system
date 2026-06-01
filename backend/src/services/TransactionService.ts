import { prisma } from '../utils/prisma.js';
import { TransactionRepository } from '../repositories/TransactionRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { ApiError } from '../utils/ApiError.js';

const transactionRepository = new TransactionRepository();
const productRepository = new ProductRepository();

export class TransactionService {
  async getAll(filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.userId) where.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>).lte = end;
      }
    }

    return transactionRepository.findWithPagination({
      where,
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      page,
      limit,
    });
  }

  async getById(id: string) {
    const transaction = await transactionRepository.findById(id, {
      items: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
      payments: true,
      customer: true,
      user: { select: { id: true, name: true, email: true } },
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }
    return transaction;
  }

  async getByInvoiceNumber(invoiceNumber: string) {
    const transaction = await transactionRepository.findByInvoiceNumber(invoiceNumber);
    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }
    return transaction;
  }

  async refundTransaction(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id, { items: true });
    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    if (transaction.status === 'REFUNDED') {
      throw ApiError.badRequest('Transaction is already refunded');
    }

    if (transaction.status === 'CANCELLED') {
      throw ApiError.badRequest('Transaction is already cancelled');
    }

    const refunded = await prisma.$transaction(async (tx) => {
      for (const item of transaction.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            quantity: item.quantity,
            notes: `Refund - ${transaction.invoiceNumber}`,
            userId,
          },
        });
      }

      return tx.transaction.update({
        where: { id },
        data: { status: 'REFUNDED' },
        include: {
          items: true,
          payments: true,
          customer: true,
        },
      });
    });

    return refunded;
  }

  async getSalesSummary(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    return transactionRepository.getSalesSummary(start, end);
  }
}
