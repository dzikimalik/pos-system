import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Full system access',
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: {
      name: 'CASHIER',
      description: 'Cashier with limited access',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      email: 'admin@pos.com',
      password: hashedPassword,
      name: 'Admin Utama',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'cashier@pos.com' },
    update: {},
    create: {
      email: 'cashier@pos.com',
      password: hashedPassword,
      name: 'Kasir Satu',
      roleId: cashierRole.id,
      isActive: true,
    },
  });

  const categories = [
    { name: 'Makanan', description: 'Makanan berat dan ringan' },
    { name: 'Minuman', description: 'Minuman kemasan dan segar' },
    { name: 'Snack', description: 'Camilan dan kudapan' },
    { name: 'Sembako', description: 'Sembilan bahan pokok' },
    { name: 'Lainnya', description: 'Produk lainnya' },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories[cat.name] = created.id;
  }

  const products = [
    { name: 'Nasi Goreng', description: 'Nasi goreng spesial', price: 25000, cost: 15000, stock: 50, sku: 'SKU-001', barcode: '8990001001', categoryName: 'Makanan' },
    { name: 'Mie Goreng', description: 'Mie goreng spesial', price: 20000, cost: 10000, stock: 60, sku: 'SKU-002', barcode: '8990001002', categoryName: 'Makanan' },
    { name: 'Ayam Bakar', description: 'Ayam bakar bumbu kecap', price: 35000, cost: 20000, stock: 30, sku: 'SKU-003', barcode: '8990001003', categoryName: 'Makanan' },
    { name: 'Air Mineral', description: 'Air mineral 600ml', price: 5000, cost: 3000, stock: 100, sku: 'SKU-004', barcode: '8990001004', categoryName: 'Minuman' },
    { name: 'Kopi Susu', description: 'Kopi susu kekinian', price: 15000, cost: 8000, stock: 80, sku: 'SKU-005', barcode: '8990001005', categoryName: 'Minuman' },
    { name: 'Jus Jeruk', description: 'Jus jeruk segar', price: 12000, cost: 6000, stock: 40, sku: 'SKU-006', barcode: '8990001006', categoryName: 'Minuman' },
    { name: 'Keripik Singkong', description: 'Keripik singkong pedas', price: 8000, cost: 4000, stock: 90, sku: 'SKU-007', barcode: '8990001007', categoryName: 'Snack' },
    { name: 'Kacang Panggang', description: 'Kacang panggang gurih', price: 10000, cost: 5000, stock: 70, sku: 'SKU-008', barcode: '8990001008', categoryName: 'Snack' },
    { name: 'Beras 5kg', description: 'Beras premium 5kg', price: 65000, cost: 55000, stock: 20, sku: 'SKU-009', barcode: '8990001009', categoryName: 'Sembako' },
    { name: 'Minyak Goreng 1L', description: 'Minyak goreng sawit 1L', price: 18000, cost: 14000, stock: 35, sku: 'SKU-010', barcode: '8990001010', categoryName: 'Sembako' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        description: p.description,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        sku: p.sku,
        barcode: p.barcode,
        categoryId: createdCategories[p.categoryName],
        isActive: true,
      },
    });
  }

  await prisma.customer.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: 'Pelanggan Satu',
      email: 'customer1@example.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 1, Jakarta',
      isActive: true,
    },
  });

  await prisma.customer.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      name: 'Pelanggan Dua',
      email: 'customer2@example.com',
      phone: '081234567891',
      address: 'Jl. Sudirman No. 2, Jakarta',
      isActive: true,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
