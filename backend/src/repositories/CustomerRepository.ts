import { prisma } from '../utils/prisma.js';
import { BaseRepository } from './BaseRepository.js';

export class CustomerRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.customer as any, 'customer');
  }

  async findByEmail(email: string): Promise<any | null> {
    return prisma.customer.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findByPhone(phone: string): Promise<any | null> {
    return prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });
  }

  async search(query: string, params?: { page?: number; limit?: number }): Promise<{ data: any[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total };
  }
}
