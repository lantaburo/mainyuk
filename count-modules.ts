import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const modules = await prisma.module.findMany({ include: { subject: true } });
  console.log(`Total modules: ${modules.length}`);
  for (const m of modules) {
    console.log(`- Kelas ${m.gradeLevel}: ${m.subject.name} - ${m.title}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
