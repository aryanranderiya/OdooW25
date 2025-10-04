import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Transportation',
  'Accommodation',
  'Software & Subscriptions',
  'Marketing & Advertising',
  'Training & Education',
  'Equipment & Hardware',
  'Utilities',
  'Communication',
  'Other',
];

async function main() {
  console.log('Starting database seeding...');

  // Create a default company if none exists
  let company = await prisma.company.findFirst();

  if (company) {
    console.log(`Using existing company: ${company.name}`);
  } else {
    console.log('Creating default company...');
    company = await prisma.company.create({
      data: {
        name: 'Default Company',
        country: 'US',
        currency: 'USD',
      },
    });
    console.log(`Created company: ${company.name}`);
  }

  // Create default admin user if none exists
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@company.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        companyId: company.id,
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  } else {
    console.log(`Using existing admin user: ${adminUser.email}`);
  }

  // Create default categories for the company
  console.log('Creating expense categories...');

  for (const categoryName of DEFAULT_CATEGORIES) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
        companyId: company.id,
      },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: categoryName,
          companyId: company.id,
        },
      });
      console.log(`  Created category: ${categoryName}`);
    } else {
      console.log(`  Category already exists: ${categoryName}`);
    }
  }

  console.log('Database seeding completed successfully!');
  console.log('\nSummary:');
  console.log(`   Company: ${company.name}`);
  console.log(`   Admin User: ${adminUser.email} (password: admin123)`);
  console.log(`   Categories: ${DEFAULT_CATEGORIES.length} expense categories`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    return prisma.$disconnect();
  });
