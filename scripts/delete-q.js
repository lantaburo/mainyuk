const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Mencari modul kelas 2 sampai 6...');
  
  const modules = await prisma.module.findMany({
    where: { gradeLevel: { gte: 2 } },
    select: { id: true, title: true, gradeLevel: true }
  });

  console.log(`Ditemukan ${modules.length} modul dari kelas 2 ke atas.`);
  
  if (modules.length === 0) {
    console.log('Tidak ada yang perlu dihapus.');
    return;
  }

  const moduleIds = modules.map(m => m.id);

  console.log('Menghapus soal-soal terkait...');
  
  const result = await prisma.question.deleteMany({
    where: {
      moduleId: { in: moduleIds }
    }
  });

  console.log(`Berhasil menghapus ${result.count} soal dari database.`);
}

main()
  .catch(e => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
