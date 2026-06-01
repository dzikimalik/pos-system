import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/CustomerService.js';
import { sendSuccess, sendPaginated, createPagination } from '../utils/response.js';

const customerService = new CustomerService();

export class CustomerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '10'), 10);

      const { data, total } = await customerService.getAll({ page, limit });
      sendPaginated(res, data, createPagination(total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(String(req.params.id));
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create(req.body);
      sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.update(String(req.params.id), req.body);
      sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.delete(String(req.params.id));
      sendSuccess(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = String(req.query.q || '');
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '20'), 10);

      if (!query) {
        sendSuccess(res, []);
        return;
      }

      const { data, total } = await customerService.search(query, page, limit);
      sendPaginated(res, data, createPagination(total, page, limit));
    } catch (error) {
      next(error);
    }
  }
}
