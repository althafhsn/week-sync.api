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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
