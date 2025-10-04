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

  console.log('Creating default admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@company.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      companyId: company.id,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // Create default categories for the company
  console.log('Creating expense categories...');

  const categories: Array<{ id: string; name: string }> = [];
  for (const categoryName of DEFAULT_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: {
        name: categoryName,
        companyId: company.id,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          companyId: company.id,
        },
      });
      console.log(`  Created category: ${categoryName}`);
    } else {
      console.log(`  Category already exists: ${categoryName}`);
    }
    categories.push(category);
  }

  // Create dummy expenses for the last 90 days
  console.log('Creating dummy expenses...');

  const existingExpenses = await prisma.expense.count({
    where: { companyId: company.id },
  });

  if (existingExpenses > 0) {
    console.log(`  Clearing ${existingExpenses} existing expenses...`);
    await prisma.expense.deleteMany({
      where: { companyId: company.id },
    });
  }

  const expenseStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
  const today = new Date();
  let expensesCreated = 0;

  // Create expenses for the past 1 month (30 days)
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random 1-3 expenses per day
    const expensesForDay = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < expensesForDay; j++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const amount = Math.floor(Math.random() * 500) + 50; // $50 - $550
      const status =
        expenseStatuses[Math.floor(Math.random() * expenseStatuses.length)];

      // Set appropriate dates based on status
      const submittedAt = status !== 'DRAFT' ? date : null;
      const approvedAt =
        status === 'APPROVED'
          ? new Date(date.getTime() + 24 * 60 * 60 * 1000)
          : null; // +1 day
      const rejectedAt =
        status === 'REJECTED'
          ? new Date(date.getTime() + 24 * 60 * 60 * 1000)
          : null; // +1 day

      await prisma.expense.create({
        data: {
          title: `${category.name} expense for ${date.toLocaleDateString()}`,
          description: `Sample expense from seed data`,
          originalAmount: amount,
          originalCurrency: company.currency,
          convertedAmount: amount,
          companyCurrency: company.currency,
          exchangeRate: 1.0,
          expenseDate: date,
          status: status as any,
          submitterId: adminUser.id,
          companyId: company.id,
          categoryId: category.id,
          submittedAt,
          approvedAt,
          rejectedAt,
        },
      });
      expensesCreated++;
    }
  }

  console.log(`  Created ${expensesCreated} dummy expenses`);

  console.log('Database seeding completed successfully!');
  console.log('\nSummary:');
  console.log(`   Company: ${company.name}`);
  console.log(`   Admin User: ${adminUser.email} (password: admin123)`);
  console.log(`   Categories: ${DEFAULT_CATEGORIES.length} expense categories`);
  console.log(`   Expenses: Populated with 30 days of sample data`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
