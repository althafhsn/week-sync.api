import { PrismaClient, ReportHighlightCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLookup(
  model: { upsert: (args: any) => Promise<unknown> },
  names: string[],
) {
  for (const name of names) {
    await model.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function main() {
  await seedLookup(prisma.projectStatus, ['Proposed', 'Active', 'Archived']);
  await seedLookup(prisma.role, ['Manager', 'Team Member']);
  await seedLookup(prisma.userStatus, ['Pending Approval', 'Approved', 'Rejected']);

  await seedLookup(prisma.reportStatus, [
    'Draft',
    'Submitted',
    'Needs Correction',
    'Approved',
  ]);

  await seedLookup(prisma.priorityType, ['Medium', 'High', 'Critical']);

  await seedLookup(prisma.taskStatus, [
    'In Progress',
    'Blocked',
    'Carried Over',
    'Completed',
  ]);

  await seedLookup(prisma.reportHourType, [
    'Development',
    'Testing',
    'Meeting',
    'Documentation',
  ]);

  const highlightTypes: { name: string; category: ReportHighlightCategory }[] = [
    { name: 'Achievement', category: ReportHighlightCategory.ACHIEVEMENT },
    { name: 'Highlight', category: ReportHighlightCategory.ACHIEVEMENT },
    { name: 'Blocker', category: ReportHighlightCategory.BLOCKER },
    { name: 'Challenge', category: ReportHighlightCategory.BLOCKER },
  ];

  for (const { name, category } of highlightTypes) {
    await prisma.reportHighlightType.upsert({
      where: { name },
      update: { category },
      create: { name, category },
    });
  }

  const users = [
    {
      id: 'af5e71f8-0e6a-4775-ab2e-c2a2d5b85e96',
      name: 'Althaf',
      email: 'althafhsn.c@gmail.com',
      passwordHash: '$2b$12$nhf9czjXRmIcrpDpDgHI/OqQYnoLUTJakoM5V.IZ2e6lInjPXd03C',
      isActive: true,
      createdAt: new Date('2026-09-06T13:11:57.471Z'),
      mustChangePassword: false,
      roleId: 1,
      userStatusId: 2,
      jobTitle: 'Tech Lead',
    },
    {
      id: 'd0272135-aa68-4aa6-971f-a26db4e1a2b0',
      name: 'Imthath',
      email: 'Imthat@weeksync.com',
      passwordHash: '$2b$12$AHGkwHHsWzaIBgQ.JK7aTOVQmOD4suku7JwYP.AL4UpgQkUiHVwc2',
      isActive: true,
      createdAt: new Date('2026-09-06T13:39:57.919Z'),
      mustChangePassword: true,
      roleId: 2,
      userStatusId: 2,
      jobTitle: null,
    },
    {
      id: 'daf228ec-de15-489a-8351-79c49e81fa91',
      name: 'Nasra',
      email: 'nasra@example.com',
      passwordHash: '$2b$12$GcnIspnLpFZArmzkiKQmde7gm4a1U.hUaJUng.ORrQCf4hShNIrpq',
      isActive: true,
      createdAt: new Date('2026-09-06T13:38:36.637Z'),
      mustChangePassword: false,
      roleId: 2,
      userStatusId: 2,
      jobTitle: 'Software Engineer',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({ where: { id: user.id }, update: user, create: user });
  }

  const projects = [
    {
      id: '23fd3c57-8f7b-476f-be36-33c895729713',
      name: 'Orbit Mobile',
      description: 'Cross-platform mobile client for field teams.',
      isActive: true,
      createdAt: new Date('2026-09-06T13:41:23.179Z'),
      updatedAt: new Date('2026-09-06T13:41:23.179Z'),
      projectStatusId: 3,
    },
    {
      id: '3444a9c8-e6f1-4647-a73e-664dfeba4c2d',
      name: 'Ledger Migration',
      description: 'Move reporting warehouse to the new pipeline.',
      isActive: true,
      createdAt: new Date('2026-09-06T13:41:44.004Z'),
      updatedAt: new Date('2026-09-06T13:41:44.004Z'),
      projectStatusId: 2,
    },
    {
      id: 'dacd7053-5cf7-4ecc-b7a1-3f80a86116c8',
      name: 'Atlas Billing',
      description: 'Subscription billing and invoicing revamp.',
      isActive: true,
      createdAt: new Date('2026-09-06T13:40:55.630Z'),
      updatedAt: new Date('2026-09-06T13:40:55.630Z'),
      projectStatusId: 2,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({ where: { id: project.id }, update: project, create: project });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
