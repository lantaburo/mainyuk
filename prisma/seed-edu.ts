import { prisma } from "../lib/prisma";

const SUBJECTS = [
  { name: "Agama Islam", icon: "book-open", color: "bg-green-500" },
  { name: "Matematika", icon: "calculator", color: "bg-blue-500" },
  { name: "Sains", icon: "flask-conical", color: "bg-purple-500" },
  { name: "Geografi", icon: "globe", color: "bg-emerald-500" },
  { name: "Bahasa Indonesia", icon: "pen-tool", color: "bg-orange-500" },
  { name: "Bahasa Arab", icon: "languages", color: "bg-teal-500" },
];

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Starting edu platform seeding...");
  
  for (const subj of SUBJECTS) {
    const slug = generateSlug(subj.name);
    
    // Create subject
    const subject = await prisma.subject.upsert({
      where: { slug },
      update: {
        name: subj.name,
        icon: subj.icon,
        color: subj.color,
      },
      create: {
        name: subj.name,
        slug,
        icon: subj.icon,
        color: subj.color,
      },
    });
    
    console.log(`Created Subject: ${subject.name}`);
    
    // Create 5 Modules for Class 1
    for (let i = 1; i <= 5; i++) {
      const modSlug = `${slug}-modul-${i}`;
      
      const moduleData = await prisma.module.upsert({
        where: {
          subjectId_slug: {
            subjectId: subject.id,
            slug: modSlug,
          }
        },
        update: {
          title: `Modul ${i}: ${subject.name}`,
          isPublished: true,
          isPremium: i > 2, // Modules 3, 4, 5 are premium/paid for demo
          price: i > 2 ? 15000 : 0,
        },
        create: {
          subjectId: subject.id,
          gradeLevel: 1, // Class 1
          title: `Modul ${i}: ${subject.name}`,
          slug: modSlug,
          description: `Pelajari materi dasar ${subject.name} di modul ${i}.`,
          isPublished: true,
          isPremium: i > 2,
          price: i > 2 ? 15000 : 0,
        }
      });
      
      console.log(`  - Created Module: ${moduleData.title}`);
      
      // Check if questions exist
      const qCount = await prisma.question.count({
        where: { moduleId: moduleData.id }
      });
      
      if (qCount < 20) {
        // Create 20 questions
        const questionsToCreate = [];
        for (let q = 1; q <= 20; q++) {
          questionsToCreate.push({
            moduleId: moduleData.id,
            questionText: `Ini adalah contoh pertanyaan ${q} untuk materi ${subject.name} Modul ${i}. Manakah jawaban yang paling tepat?`,
            options: [
              "Jawaban A yang salah",
              "Jawaban B yang benar",
              "Jawaban C yang salah",
              "Jawaban D yang kurang tepat"
            ],
            correctIndex: 1, // Always B for dummy
            explanation: `Penjelasan untuk pertanyaan ${q}: Jawaban B adalah yang paling tepat karena bla bla bla.`
          });
        }
        
        await prisma.question.createMany({
          data: questionsToCreate
        });
        
        console.log(`    -> Added 20 questions to ${moduleData.title}`);
      }
    }
  }
  
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
