import { CustomerRepository } from '../repositories/CustomerRepository.js';
import { ApiError } from '../utils/ApiError.js';

const customerRepository = new CustomerRepository();

export class CustomerService {
  async getAll(params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    return customerRepository.findWithPagination({ page, limit });
  }

  async getById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }
    return customer;
  }

  async create(data: { name: string; email?: string | null; phone?: string | null; address?: string | null; isActive?: boolean }) {
    if (data.email) {
      const existingEmail = await customerRepository.findByEmail(data.email);
      if (existingEmail) {
        throw ApiError.conflict('Email already registered');
      }
    }

    if (data.phone) {
      const existingPhone = await customerRepository.findByPhone(data.phone);
      if (existingPhone) {
        throw ApiError.conflict('Phone number already registered');
      }
    }

    return customerRepository.create(data);
  }

  async update(id: string, data: { name?: string; email?: string | null; phone?: string | null; address?: string | null; isActive?: boolean }) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    if (data.email && data.email !== customer.email) {
      const existingEmail = await customerRepository.findByEmail(data.email);
      if (existingEmail) {
        throw ApiError.conflict('Email already registered');
      }
    }

    if (data.phone && data.phone !== customer.phone) {
      const existingPhone = await customerRepository.findByPhone(data.phone);
      if (existingPhone) {
        throw ApiError.conflict('Phone number already registered');
      }
    }

    return customerRepository.update(id, data);
  }

  async delete(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }
    return customerRepository.softDelete(id);
  }

  async search(query: string, page = 1, limit = 20) {
    return customerRepository.search(query, { page, limit });
  }
}
