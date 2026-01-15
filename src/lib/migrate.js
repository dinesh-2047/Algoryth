const { PrismaClient } = require('@prisma/client');
const { problems } = require('./problems');

const prisma = new PrismaClient();

async function migrateProblems() {
  console.log('Starting migration...');

  for (const problem of problems) {
    await prisma.problem.create({
      data: {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags,
        statement: problem.statement,
        constraints: problem.constraints,
        examples: problem.examples,
      },
    });
  }

  console.log('Migration completed.');
}

migrateProblems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
