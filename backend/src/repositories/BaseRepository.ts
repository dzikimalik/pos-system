import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma.js';

type PrismaDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown>;
  findFirst: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  updateMany: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
  count: (args: unknown) => Promise<number>;
};

export class BaseRepository<T extends Record<string, unknown>> {
  protected delegate: PrismaDelegate;
  protected modelName: string;

  constructor(delegate: PrismaDelegate, modelName: string) {
    this.delegate = delegate;
    this.modelName = modelName;
  }

  async findMany(params?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, string>;
    include?: Record<string, unknown>;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    return this.delegate.findMany({
      where: { deletedAt: null, ...params?.where },
      orderBy: params?.orderBy || { createdAt: 'desc' },
      include: params?.include,
      skip: params?.skip,
      take: params?.take,
    }) as Promise<T[]>;
  }

  async findById(
    id: string,
    include?: Record<string, unknown>
  ): Promise<T | null> {
    return this.delegate.findFirst({
      where: { id, deletedAt: null },
      include,
    }) as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.delegate.create({
      data: data as unknown as Record<string, unknown>,
    }) as Promise<T>;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.delegate.update({
      where: { id },
      data,
    }) as Promise<T>;
  }

  async softDelete(id: string): Promise<T> {
    return this.delegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    }) as Promise<T>;
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.delegate.count({
      where: { deletedAt: null, ...where },
    });
  }

  async findWithPagination(params: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, string>;
    include?: Record<string, unknown>;
    page: number;
    limit: number;
  }): Promise<{ data: T[]; total: number }> {
    const { page, limit, where, orderBy, include } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where: { deletedAt: null, ...where },
        orderBy: orderBy || { createdAt: 'desc' },
        include,
        skip,
        take: limit,
      }) as Promise<T[]>,
      this.delegate.count({
        where: { deletedAt: null, ...where },
      }),
    ]);

    return { data, total };
  }
}
