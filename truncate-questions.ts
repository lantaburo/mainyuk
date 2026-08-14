import { PrismaClient } from "./lib/generated/prisma2/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function truncateToLimit() {
  const modules = await prisma.module.findMany({
    include: {
      questions: {
        orderBy: { id: 'asc' }
      }
    }
  });

  for (const mod of modules) {
    let limit = 10; // default for Class 1 and 2
    if (mod.gradeLevel === 3) limit = 15;
    if (mod.gradeLevel === 4 || mod.gradeLevel === 5) limit = 20;
    if (mod.gradeLevel === 6) limit = 25;

    if (mod.questions.length > limit) {
      const questionsToDelete = mod.questions.slice(limit);
      const idsToDelete = questionsToDelete.map(q => q.id);
      
      await prisma.question.deleteMany({
        where: { id: { in: idsToDelete } }
      });
      console.log(`Truncated ${idsToDelete.length} questions from ${mod.title}`);
    }
  }
}

truncateToLimit().catch(console.error).finally(() => process.exit(0));
