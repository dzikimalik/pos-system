import { prisma } from '../utils/prisma.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.user as any, 'user');
  }

  async findByEmail(email: string): Promise<any | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });
  }

  async findByIdWithRole(id: string): Promise<any | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });
  }

  async findAllWithRole(params?: {
    page?: number;
    limit?: number;
    where?: Record<string, unknown>;
  }): Promise<{ data: any[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null, ...params?.where },
        include: { role: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: { deletedAt: null, ...params?.where },
      }),
    ]);

    return { data, total };
  }
}
