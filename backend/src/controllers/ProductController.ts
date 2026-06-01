import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService.js';
import { sendSuccess, sendPaginated, createPagination } from '../utils/response.js';

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '10'), 10);
      const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
      const isActive = req.query.isActive !== undefined ? String(req.query.isActive) === 'true' : undefined;

      const { data, total } = await productService.getAll({ page, limit, categoryId, isActive });
      sendPaginated(res, data, createPagination(total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(String(req.params.id));
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(String(req.params.id), req.body);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(String(req.params.id));
      sendSuccess(res, null, 'Product deleted successfully');
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

      const { data, total } = await productService.search(query, page, limit);
      sendPaginated(res, data, createPagination(total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async findByBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findByBarcode(String(req.params.barcode));
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }
}
