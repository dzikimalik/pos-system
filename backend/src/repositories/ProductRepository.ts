import { prisma } from '../utils/prisma.js';
import { BaseRepository } from './BaseRepository.js';

export class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.product as any, 'product');
  }

  async findBySku(sku: string): Promise<any | null> {
    return prisma.product.findFirst({
      where: { sku, deletedAt: null },
      include: { category: true },
    });
  }

  async findByBarcode(barcode: string): Promise<any | null> {
    return prisma.product.findFirst({
      where: { barcode, deletedAt: null },
      include: { category: true },
    });
  }

  async search(query: string, params?: { page?: number; limit?: number }): Promise<{ data: any[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { sku: { contains: query, mode: 'insensitive' as const } },
        { barcode: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, total };
  }

  async updateStock(id: string, quantity: number): Promise<any> {
    return prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  }

  async findLowStock(threshold: number): Promise<any[]> {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        stock: { lte: threshold },
      },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });
  }
}
