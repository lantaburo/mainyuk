const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSkills() {
  const skills = [
    {
      name: "Aturan Penulisan Bahasa Arab",
      description: "Khusus mapel Arab: wajib menggunakan khat/tulisan Arab.",
      isSystem: true,
      content: "Khusus untuk mata pelajaran Bahasa Arab, semua kosakata, frasa, atau kalimat berbahasa Arab WAJIB ditulis menggunakan tulisan/khat huruf Arab asli, bukan latinnya. (Contoh: tulis كِتَابٌ bukan kitabun)."
    },
    {
      name: "Rujukan Tsaqafah",
      description: "Pedoman pembuatan soal Tsaqafah.",
      isSystem: true,
      content: "Khusus untuk materi Tsaqafah, jadikan Al-Quran, As-Sunnah, dan kitab Nidzamul Islam karya Syaikh Taqiyuddin an-Nabhani sebagai rujukan utama dalam pembuatan soal maupun penjelasannya."
    }
  ];

  for (const s of skills) {
    const existing = await prisma.aiSkill.findUnique({ where: { name: s.name } });
    if (!existing) {
      const skill = await prisma.aiSkill.create({
        data: {
          name: s.name,
          description: s.description,
          isSystem: s.isSystem,
          isActive: true
        }
      });
      await prisma.aiSkillVersion.create({
        data: {
          skillId: skill.id,
          content: s.content,
          version: 1,
          isActive: true
        }
      });
      console.log(`Created skill: ${s.name}`);
    }
  }
}

seedSkills()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
