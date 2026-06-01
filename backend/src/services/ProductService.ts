import { ProductRepository } from '../repositories/ProductRepository.js';
import { ApiError } from '../utils/ApiError.js';

const productRepository = new ProductRepository();

export class ProductService {
  async getAll(params: { page?: number; limit?: number; categoryId?: string; isActive?: boolean }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const where: Record<string, unknown> = {};

    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.isActive !== undefined) where.isActive = params.isActive;

    return productRepository.findWithPagination({
      where,
      include: { category: true },
      page,
      limit,
    });
  }

  async getById(id: string) {
    const product = await productRepository.findById(id, { category: true });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async create(data: any) {
    const existingSku = await productRepository.findBySku(data.sku);
    if (existingSku) {
      throw ApiError.conflict('SKU already exists');
    }

    const existingBarcode = await productRepository.findByBarcode(data.barcode);
    if (existingBarcode) {
      throw ApiError.conflict('Barcode already exists');
    }

    return productRepository.create(data);
  }

  async update(id: string, data: any) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await productRepository.findBySku(data.sku);
      if (existingSku) {
        throw ApiError.conflict('SKU already exists');
      }
    }

    if (data.barcode && data.barcode !== product.barcode) {
      const existingBarcode = await productRepository.findByBarcode(data.barcode);
      if (existingBarcode) {
        throw ApiError.conflict('Barcode already exists');
      }
    }

    return productRepository.update(id, data);
  }

  async delete(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return productRepository.softDelete(id);
  }

  async search(query: string, page = 1, limit = 20) {
    return productRepository.search(query, { page, limit });
  }

  async findByBarcode(barcode: string) {
    const product = await productRepository.findByBarcode(barcode);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async updateStock(id: string, quantity: number) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return productRepository.updateStock(id, quantity);
  }

  async getLowStock(threshold = 10) {
    return productRepository.findLowStock(threshold);
  }
}
