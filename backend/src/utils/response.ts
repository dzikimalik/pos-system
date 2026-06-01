import { Response } from 'express';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: unknown[]): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

export function sendPaginated<T>(res: Response, data: T[], pagination: PaginationInfo): void {
  res.status(200).json({
    success: true,
    message: 'Success',
    data,
    pagination,
  });
}

export function createPagination(total: number, page: number, limit: number): PaginationInfo {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
