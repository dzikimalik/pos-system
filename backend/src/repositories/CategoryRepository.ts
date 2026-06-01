import { prisma } from '../utils/prisma.js';
import { BaseRepository } from './BaseRepository.js';

export class CategoryRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.category as any, 'category');
  }

  async findByName(name: string): Promise<any | null> {
    return prisma.category.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findAllWithProductCount(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { products: true } } },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where: { deletedAt: null } }),
    ]);

    return { data, total };
  }
}
