import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS System API',
      version: '1.0.0',
      description: 'REST API for Point of Sale System',
      contact: {
        name: 'API Support',
        email: 'support@pos.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@pos.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { $ref: '#/components/schemas/Role' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Role: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            cost: { type: 'number' },
            stock: { type: 'integer' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            category: { $ref: '#/components/schemas/Category' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProductInput: {
          type: 'object',
          required: ['name', 'price', 'sku', 'barcode', 'categoryId'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            cost: { type: 'number', default: 0 },
            stock: { type: 'integer', default: 0 },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            image: { type: 'string' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCustomerInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            invoiceNumber: { type: 'string' },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            discount: { type: 'number' },
            total: { type: 'number' },
            paymentMethod: { type: 'string' },
            cashAmount: { type: 'number' },
            changeAmount: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'] },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/TransactionItem' },
            },
            customer: { $ref: '#/components/schemas/Customer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TransactionItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            productName: { type: 'string' },
            quantity: { type: 'integer' },
            price: { type: 'number' },
            subtotal: { type: 'number' },
          },
        },
        CreateTransactionInput: {
          type: 'object',
          required: ['items', 'paymentMethod'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity', 'price'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
            paymentMethod: { type: 'string', enum: ['CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'E_WALLET', 'TRANSFER'] },
            cashAmount: { type: 'number' },
            customerId: { type: 'string', format: 'uuid' },
            notes: { type: 'string' },
            discount: { type: 'number', default: 0 },
            tax: { type: 'number', default: 0 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalProducts: { type: 'integer' },
            totalTransactions: { type: 'integer' },
            revenueToday: { type: 'number' },
            revenueThisMonth: { type: 'number' },
            totalCustomers: { type: 'integer' },
            totalCategories: { type: 'integer' },
            pendingTransactions: { type: 'integer' },
            lowStockProducts: { type: 'integer' },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register new user',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
          },
          responses: { 201: { description: 'User registered' }, 409: { description: 'Email conflict' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User data' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: { 200: { description: 'List of products' } },
        },
        post: {
          tags: ['Products'],
          summary: 'Create product',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductInput' } } } },
          responses: { 201: { description: 'Product created' }, 400: { description: 'Validation error' } },
        },
      },
      '/products/search': {
        get: {
          tags: ['Products'],
          summary: 'Search products',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Search results' } },
        },
      },
      '/products/barcode/{barcode}': {
        get: {
          tags: ['Products'],
          summary: 'Find product by barcode',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'barcode', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product found' }, 404: { description: 'Not found' } },
        },
      },
      '/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product data' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Products'],
          summary: 'Update product',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductInput' } } } },
          responses: { 200: { description: 'Product updated' } },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product (soft)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product deleted' } },
        },
      },
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all categories',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List of categories' } },
        },
        post: {
          tags: ['Categories'],
          summary: 'Create category',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryInput' } } } },
          responses: { 201: { description: 'Category created' } },
        },
      },
      '/categories/{id}': {
        get: {
          tags: ['Categories'],
          summary: 'Get category by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Category data' } },
        },
        put: {
          tags: ['Categories'],
          summary: 'Update category',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Category updated' } },
        },
        delete: {
          tags: ['Categories'],
          summary: 'Delete category',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Category deleted' } },
        },
      },
      '/customers': {
        get: {
          tags: ['Customers'],
          summary: 'Get all customers',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List of customers' } },
        },
        post: {
          tags: ['Customers'],
          summary: 'Create customer',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCustomerInput' } } } },
          responses: { 201: { description: 'Customer created' } },
        },
      },
      '/customers/search': {
        get: {
          tags: ['Customers'],
          summary: 'Search customers',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Search results' } },
        },
      },
      '/customers/{id}': {
        get: {
          tags: ['Customers'],
          summary: 'Get customer by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer data' } },
        },
        put: {
          tags: ['Customers'],
          summary: 'Update customer',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer updated' } },
        },
        delete: {
          tags: ['Customers'],
          summary: 'Delete customer',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer deleted' } },
        },
      },
      '/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard statistics',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardStats' } } } } },
        },
      },
      '/dashboard/best-selling': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get best selling products',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer' } }],
          responses: { 200: { description: 'Best selling products' } },
        },
      },
      '/dashboard/recent-transactions': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get recent transactions',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer' } }],
          responses: { 200: { description: 'Recent transactions' } },
        },
      },
      '/cashier/transaction': {
        post: {
          tags: ['Cashier'],
          summary: 'Process a transaction',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTransactionInput' } } } },
          responses: { 201: { description: 'Transaction processed' }, 400: { description: 'Validation or stock error' } },
        },
      },
      '/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'Get all transactions',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { 200: { description: 'List of transactions' } },
        },
      },
      '/transactions/invoice/{invoiceNumber}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transaction by invoice number',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'invoiceNumber', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Transaction data' } },
        },
      },
      '/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transaction by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Transaction data' } },
        },
      },
      '/transactions/{id}/refund': {
        post: {
          tags: ['Transactions'],
          summary: 'Refund a transaction',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Transaction refunded' } },
        },
      },
      '/reports/daily': {
        get: {
          tags: ['Reports'],
          summary: 'Get daily sales report',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }],
          responses: { 200: { description: 'Daily sales report' } },
        },
      },
      '/reports/weekly': {
        get: {
          tags: ['Reports'],
          summary: 'Get weekly sales report',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { 200: { description: 'Weekly sales report' } },
        },
      },
      '/reports/monthly': {
        get: {
          tags: ['Reports'],
          summary: 'Get monthly sales report',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'year', in: 'query', schema: { type: 'integer' } },
            { name: 'month', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Monthly sales report' } },
        },
      },
      '/reports/products': {
        get: {
          tags: ['Reports'],
          summary: 'Get product sales report',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { 200: { description: 'Product sales report' } },
        },
      },
      '/reports/export/csv': {
        get: {
          tags: ['Reports'],
          summary: 'Export report as CSV',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['transactions', 'products', 'sales'] } },
          ],
          responses: { 200: { description: 'CSV file' } },
        },
      },
      '/reports/export/excel': {
        get: {
          tags: ['Reports'],
          summary: 'Export report data',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['transactions', 'products', 'sales'] } },
          ],
          responses: { 200: { description: 'Export data' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
