import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { email: 'lantaburo.cmo@gmail.com' } });
  console.log('Users:', users);
  const affs = await prisma.affiliateCode.findMany({ where: { ownerEmail: 'lantaburo.cmo@gmail.com' } });
  console.log('Affiliates:', affs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
