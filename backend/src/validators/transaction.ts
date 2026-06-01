import { z } from 'zod';

export const transactionItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

export const createTransactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  cashAmount: z.number().positive('Cash amount must be positive').optional().nullable(),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  notes: z.string().optional().nullable(),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
});

export const updateTransactionSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED']).optional(),
  notes: z.string().optional().nullable(),
  discount: z.number().min(0).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
