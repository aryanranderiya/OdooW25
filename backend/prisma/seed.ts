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

async function createUsersAndRules(companyId: string, userPassword: string) {
  console.log('Creating manager users...');
  const managers: any[] = [];

  const managerData = [
    { name: 'Dhruv', email: 'dhruv@gmail.com' },
    { name: 'Sankalpa', email: 'sankalpa@gmail.com' },
    { name: 'Vinit', email: 'vinit@gmail.com' },
    { name: 'Sahil', email: 'sahil@gmail.com' },
    { name: 'Darsh', email: 'darsh@gmail.com' },
  ];

  for (const data of managerData) {
    let manager = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!manager) {
      manager = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: userPassword,
          role: 'MANAGER',
          emailVerified: true,
          companyId,
          isManagerApprover: true,
        },
      });
      console.log(`  Created manager: ${manager.email}`);
    } else {
      console.log(`  Using existing manager: ${manager.email}`);
    }
    managers.push(manager);
  }

  // Specific approver (not in sequential)
  let specificApprover = await prisma.user.findUnique({
    where: { email: 'specificapprover@gmail.com' },
  });
  if (!specificApprover) {
    specificApprover = await prisma.user.create({
      data: {
        name: 'Specific Approver',
        email: 'specificapprover@gmail.com',
        passwordHash: userPassword,
        role: 'MANAGER',
        emailVerified: true,
        companyId,
        isManagerApprover: true,
      },
    });
    console.log(`  Created specific approver: ${specificApprover.email}`);
  } else {
    console.log(
      `  Using existing specific approver: ${specificApprover.email}`,
    );
  }

  console.log('Creating employee users...');
  const employees: any[] = [];

  const employeeData = [
    {
      name: 'Employee One',
      email: 'employee1@gmail.com',
      managerId: managers[0].id,
    },
    {
      name: 'Employee Two',
      email: 'employee2@gmail.com',
      managerId: managers[0].id,
    },
    {
      name: 'Employee Three',
      email: 'employee3@gmail.com',
      managerId: managers[1].id,
    },
    {
      name: 'Employee Four',
      email: 'employee4@gmail.com',
      managerId: managers[2].id,
    },
    {
      name: 'Employee Five',
      email: 'employee5@gmail.com',
      managerId: managers[3].id,
    },
  ];

  for (const data of employeeData) {
    let employee = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!employee) {
      employee = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: userPassword,
          role: 'EMPLOYEE',
          emailVerified: true,
          companyId,
          managerId: data.managerId,
        },
      });
      console.log(`  Created employee: ${employee.email}`);
    } else {
      console.log(`  Using existing employee: ${employee.email}`);
    }
    employees.push(employee);
  }

  // Create approval rules
  console.log('Creating approval rules...');

  // 1. Sequential Rule
  const seqRule = await prisma.approvalRule.findFirst({
    where: { name: 'Sequential Approval - 3 Levels', companyId },
  });
  if (!seqRule) {
    await prisma.approvalRule.create({
      data: {
        name: 'Sequential Approval - 3 Levels',
        description: 'Requires approval from 3 managers in sequence',
        ruleType: 'SEQUENTIAL',
        isActive: true,
        companyId,
        minAmount: 0,
        maxAmount: 1000,
        approvalSteps: {
          create: [
            { sequence: 1, approverId: managers[0].id, isRequired: true },
            { sequence: 2, approverId: managers[1].id, isRequired: true },
            { sequence: 3, approverId: managers[2].id, isRequired: true },
          ],
        },
      },
    });
    console.log('  Created rule: Sequential Approval - 3 Levels');
  } else {
    console.log('  Rule exists: Sequential Approval - 3 Levels');
  }

  // 2. Percentage Rule
  const pctRule = await prisma.approvalRule.findFirst({
    where: { name: 'Percentage Approval - 75% of 4', companyId },
  });
  if (!pctRule) {
    await prisma.approvalRule.create({
      data: {
        name: 'Percentage Approval - 75% of 4',
        description: 'Requires 75% approval (3 out of 4 managers)',
        ruleType: 'PERCENTAGE',
        isActive: true,
        companyId,
        minAmount: 1001,
        maxAmount: 5000,
        percentageThreshold: 75,
        approvalSteps: {
          create: [
            { sequence: 1, approverId: managers[0].id, isRequired: false },
            { sequence: 2, approverId: managers[1].id, isRequired: false },
            { sequence: 3, approverId: managers[2].id, isRequired: false },
            { sequence: 4, approverId: managers[3].id, isRequired: false },
          ],
        },
      },
    });
    console.log('  Created rule: Percentage Approval - 75% of 4');
  } else {
    console.log('  Rule exists: Percentage Approval - 75% of 4');
  }

  // 3. Specific Approver Rule
  const specRule = await prisma.approvalRule.findFirst({
    where: { name: 'Specific Approver - Senior Manager', companyId },
  });
  if (!specRule) {
    await prisma.approvalRule.create({
      data: {
        name: 'Specific Approver - Senior Manager',
        description: 'Requires approval from senior manager only',
        ruleType: 'SPECIFIC_APPROVER',
        isActive: true,
        companyId,
        minAmount: 5001,
        maxAmount: null,
        specificApproverId: specificApprover.id,
      },
    });
    console.log('  Created rule: Specific Approver - Senior Manager');
  } else {
    console.log('  Rule exists: Specific Approver - Senior Manager');
  }
}

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

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('Password@123', 10);

  if (!adminUser) {
    console.log('Creating default admin user...');
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
  } else {
    console.log(`Using existing admin user: ${adminUser.email}`);
  }

  // Create manager and employee users
  await createUsersAndRules(company.id, userPassword);

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

      // Use different currencies
      const currencies = ['INR', 'USD', 'JPY', 'EUR'];
      const currency =
        currencies[Math.floor(Math.random() * currencies.length)];

      // Different amount ranges based on currency
      let amount: number;
      let exchangeRate: number;
      let convertedAmount: number;

      switch (currency) {
        case 'INR':
          amount = Math.floor(Math.random() * 40000) + 4000; // ₹4,000 - ₹44,000
          exchangeRate = 0.012; // INR to USD
          convertedAmount = amount * exchangeRate;
          break;
        case 'JPY':
          amount = Math.floor(Math.random() * 75000) + 7500; // ¥7,500 - ¥82,500
          exchangeRate = 0.0067; // JPY to USD
          convertedAmount = amount * exchangeRate;
          break;
        case 'EUR':
          amount = Math.floor(Math.random() * 500) + 50; // €50 - €550
          exchangeRate = 1.08; // EUR to USD
          convertedAmount = amount * exchangeRate;
          break;
        default: // USD
          amount = Math.floor(Math.random() * 500) + 50; // $50 - $550
          exchangeRate = 1.0;
          convertedAmount = amount;
      }

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
          originalCurrency: currency,
          convertedAmount: convertedAmount,
          companyCurrency: company.currency,
          exchangeRate: exchangeRate,
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
  console.log(`   Managers: 6 users (password: Password@123)`);
  console.log(`   Employees: 5 users (password: Password@123)`);
  console.log(`   Categories: ${DEFAULT_CATEGORIES.length} expense categories`);
  console.log(`   Expenses: Populated with 30 days of sample data`);
  console.log(`   Approval Rules: 3 rules (Sequential, Percentage, Specific)`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
