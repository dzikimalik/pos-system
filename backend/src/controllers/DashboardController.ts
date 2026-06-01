import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService.js';
import { sendSuccess } from '../utils/response.js';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBestSellingProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(String(req.query.limit || '10'), 10);
      const products = await dashboardService.getBestSellingProducts(limit);
      sendSuccess(res, products, 'Best selling products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRecentTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(String(req.query.limit || '10'), 10);
      const transactions = await dashboardService.getRecentTransactions(limit);
      sendSuccess(res, transactions, 'Recent transactions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
