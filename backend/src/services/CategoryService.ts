import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { ApiError } from '../utils/ApiError.js';

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async getAll(params: { page?: number; limit?: number }) {
    return categoryRepository.findAllWithProductCount(params);
  }

  async getById(id: string) {
    const category = await categoryRepository.findById(id, {
      _count: { select: { products: true } },
    });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  async create(data: { name: string; description?: string; isActive?: boolean }) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw ApiError.conflict('Category name already exists');
    }
    return categoryRepository.create(data);
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (data.name && data.name !== category.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing) {
        throw ApiError.conflict('Category name already exists');
      }
    }

    return categoryRepository.update(id, data);
  }

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return categoryRepository.softDelete(id);
  }
}
