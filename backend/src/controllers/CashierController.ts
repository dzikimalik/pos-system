import { Request, Response, NextFunction } from 'express';
import { CashierService } from '../services/CashierService.js';
import { sendSuccess } from '../utils/response.js';

const cashierService = new CashierService();

export class CashierController {
  async processTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, paymentMethod, cashAmount, customerId, notes, discount, tax } = req.body;
      const userId = req.user!.userId;

      const transaction = await cashierService.processTransaction({
        items,
        paymentMethod,
        cashAmount,
        customerId,
        userId,
        notes,
        discount,
        tax,
      });

      sendSuccess(res, transaction, 'Transaction processed successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
