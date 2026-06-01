import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/TransactionService.js';
import { sendSuccess, sendPaginated, createPagination } from '../utils/response.js';

const transactionService = new TransactionService();

export class TransactionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '10'), 10);
      const status = req.query.status ? String(req.query.status) : undefined;
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
      const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
      const userId = req.query.userId ? String(req.query.userId) : undefined;

      const { data, total } = await transactionService.getAll({
        status, startDate, endDate, customerId, userId, page, limit,
      });

      sendPaginated(res, data, createPagination(total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.getById(String(req.params.id));
      sendSuccess(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  async getByInvoiceNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.getByInvoiceNumber(String(req.params.invoiceNumber));
      sendSuccess(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const transaction = await transactionService.refundTransaction(String(req.params.id), userId);
      sendSuccess(res, transaction, 'Transaction refunded successfully');
    } catch (error) {
      next(error);
    }
  }
}
