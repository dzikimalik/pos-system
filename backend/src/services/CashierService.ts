import { prisma } from '../utils/prisma.js';
import { TransactionRepository } from '../repositories/TransactionRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { ApiError } from '../utils/ApiError.js';

const transactionRepository = new TransactionRepository();
const productRepository = new ProductRepository();

export class CashierService {
  async processTransaction(data: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    paymentMethod: string;
    cashAmount?: number | null;
    customerId?: string | null;
    userId: string;
    notes?: string | null;
    discount?: number;
    tax?: number;
  }) {
    const invoiceNumber = await transactionRepository.generateInvoiceNumber();

    let subtotal = 0;
    const processedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      subtotal: number;
    }> = [];

    for (const item of data.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw ApiError.notFound(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: itemSubtotal,
      });
    }

    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = subtotal - discount + tax;

    let changeAmount: number | null = null;
    if (data.paymentMethod.toUpperCase() === 'CASH' && data.cashAmount) {
      changeAmount = this.calculateChange(total, data.cashAmount);
      if (changeAmount < 0) {
        throw ApiError.badRequest('Insufficient cash amount');
      }
    }

    const transaction = await prisma.$transaction(async (tx) => {
      for (const item of processedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            notes: `Sale - ${invoiceNumber}`,
            userId: data.userId,
          },
        });
      }

      const created = await tx.transaction.create({
        data: {
          invoiceNumber,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: data.paymentMethod,
          cashAmount: data.cashAmount || null,
          changeAmount,
          status: 'COMPLETED',
          customerId: data.customerId || null,
          userId: data.userId,
          notes: data.notes || null,
          items: {
            create: processedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })),
          },
          payments: {
            create: {
              amount: total,
              method: data.paymentMethod,
              status: 'COMPLETED',
            },
          },
        },
        include: {
          items: true,
          payments: true,
          customer: true,
        },
      });

      return created;
    });

    return transaction;
  }

  calculateChange(total: number, cashAmount: number): number {
    return Math.round((cashAmount - total) * 100) / 100;
  }

  async applyDiscount(transactionId: string, discount: number) {
    const transaction = await transactionRepository.findById(transactionId, { items: true });
    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw ApiError.badRequest('Can only apply discount to pending transactions');
    }

    const newTotal = transaction.subtotal - discount + transaction.tax;
    if (newTotal < 0) {
      throw ApiError.badRequest('Discount cannot exceed subtotal');
    }

    return transactionRepository.update(transactionId, { discount, total: newTotal });
  }

  async getReceipt(transactionId: string) {
    const transaction = await transactionRepository.findById(transactionId, {
      items: true,
      payments: true,
      customer: true,
      user: { select: { id: true, name: true } },
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    return transaction;
  }
}
