import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create or find test company
  let company = await prisma.company.findFirst({
    where: { name: 'Test Company Inc.' },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Test Company Inc.',
        country: 'United States',
        currency: 'USD',
      },
    });
  }

  console.log('Created company:', company);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@testcompany.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@testcompany.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  console.log('Created admin:', admin);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@testcompany.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@testcompany.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
      isManagerApprover: true,
      companyId: company.id,
    },
  });

  console.log('Created manager:', manager);

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@testcompany.com' },
    update: {},
    create: {
      name: 'Employee User',
      email: 'employee@testcompany.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      managerId: manager.id,
      companyId: company.id,
    },
  });

  console.log('Created employee:', employee);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Travel' } },
      update: {},
      create: { name: 'Travel', companyId: company.id },
    }),
    prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Meals & Entertainment' } },
      update: {},
      create: { name: 'Meals & Entertainment', companyId: company.id },
    }),
    prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: 'Office Supplies' } },
      update: {},
      create: { name: 'Office Supplies', companyId: company.id },
    }),
  ]);

  console.log('Created categories:', categories);

  // Create approval rules
  const approvalRule1 = await prisma.approvalRule.create({
    data: {
      name: 'Standard Approval (< $500)',
      description: 'Standard manager approval for expenses under $500',
      ruleType: 'SEQUENTIAL',
      maxAmount: 500,
      requireManagerFirst: true,
      companyId: company.id,
      approvalSteps: {
        create: [
          {
            sequence: 1,
            approverId: manager.id,
            isRequired: true,
          },
        ],
      },
    },
  });

  const approvalRule2 = await prisma.approvalRule.create({
    data: {
      name: 'High Value Approval (>= $500)',
      description: 'Multi-step approval for high-value expenses',
      ruleType: 'SEQUENTIAL',
      minAmount: 500,
      requireManagerFirst: true,
      companyId: company.id,
      approvalSteps: {
        create: [
          {
            sequence: 1,
            approverId: manager.id,
            isRequired: true,
          },
          {
            sequence: 2,
            approverId: admin.id,
            isRequired: true,
          },
        ],
      },
    },
  });

  console.log('Created approval rules:', { approvalRule1, approvalRule2 });

  // Create a percentage-based approval rule
  const percentageRule = await prisma.approvalRule.create({
    data: {
      name: 'Team Approval (60% consensus)',
      description: 'Requires 60% team approval for mid-range expenses',
      ruleType: 'PERCENTAGE',
      percentageThreshold: 60,
      minAmount: 200,
      maxAmount: 999,
      companyId: company.id,
      approvalSteps: {
        create: [
          {
            sequence: 1,
            approverId: manager.id,
            isRequired: false,
          },
          {
            sequence: 2,
            approverId: admin.id,
            isRequired: false,
          },
        ],
      },
    },
  });

  console.log('Created percentage rule:', percentageRule);

  console.log('✅ Seed data created successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('Admin: admin@testcompany.com / admin123');
  console.log('Manager: manager@testcompany.com / manager123');
  console.log('Employee: employee@testcompany.com / employee123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
