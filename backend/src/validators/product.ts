import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  cost: z.number().min(0, 'Cost cannot be negative').default(0),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  cost: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
