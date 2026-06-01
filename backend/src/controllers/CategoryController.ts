import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { sendSuccess, sendPaginated, createPagination } from '../utils/response.js';

const categoryService = new CategoryService();

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '10'), 10);

      const { data, total } = await categoryService.getAll({ page, limit });
      sendPaginated(res, data, createPagination(total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(String(req.params.id));
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(String(req.params.id), req.body);
      sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(String(req.params.id));
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
