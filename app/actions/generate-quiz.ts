"use server";

import { prisma } from "@/lib/prisma";
import { getAiConfigs } from "@/lib/ai-actions";
import { callAiProvider, extractJson, AiClientError } from "@/lib/ai-client";

export async function generateQuizModule(
  subjectName: string,
  gradeLevel: number,
  moduleTitle: string,
  questionCount: number,
  targetLevel: number | "all" = "all"
) {
  try {
    // 1. Get or Create Subject
    let subject = await prisma.subject.findFirst({
      where: { name: { equals: subjectName, mode: 'insensitive' } }
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: subjectName,
          slug: subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: "Book",
          color: "bg-indigo-500 text-indigo-50"
        }
      });
    }

    // 2. Generate prompt
    let levelInstructions = `\n- Berikan \`difficultyLevel\` antara 1 hingga 5 (1 = Dasar, 5 = HOTS).\n- Distribusikan tingkat kesulitan secara merata.`;
    if (targetLevel !== "all") {
      levelInstructions = `\n- Berikan \`difficultyLevel\` tepat ${targetLevel} untuk semua soal. (1=Dasar, 3=Penerapan, 5=HOTS).`;
    }

    let faseMerdeka = "";
    let pedomanBahasa = "";
    if (gradeLevel <= 2) {
      faseMerdeka = "Fase A (Kelas 1-2 SD)";
      pedomanBahasa = "Gunakan kalimat sangat pendek, kosakata sehari-hari yang sangat sederhana. Fokus pada pengamatan konkret, benda sekitar, dan literasi dasar.";
    } else if (gradeLevel <= 4) {
      faseMerdeka = "Fase B (Kelas 3-4 SD)";
      pedomanBahasa = "Gunakan kalimat yang mudah dicerna, mulai perkenalkan konsep sebab-akibat sederhana. Cerita bisa sedikit lebih kompleks tapi membumi pada kehidupan nyata.";
    } else {
      faseMerdeka = "Fase C (Kelas 5-6 SD)";
      pedomanBahasa = "Gunakan paragraf pendek yang melatih literasi membaca. Perkenalkan istilah ilmiah dasar, logika kritis (HOTS), dan pemecahan masalah.";
    }

    // Ambil daftar soal yang sudah ada agar tidak diulang
    const existingQuestions = await prisma.question.findMany({
      where: { 
        module: { 
          subjectId: subject.id,
          gradeLevel: gradeLevel 
        } 
      },
      select: { questionText: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    let existingQuestionsText = "";
    if (existingQuestions.length > 0) {
      existingQuestionsText = `\n**PENTING: PENCEGAHAN DUPLIKASI**\nBerikut adalah beberapa soal yang SUDAH ADA di database untuk kelas dan mata pelajaran ini. Anda **DILARANG KERAS** membuat soal yang sama atau sangat mirip dengan soal-soal di bawah ini:\n`;
      existingQuestions.forEach((q, i) => {
        existingQuestionsText += `- ${q.questionText}\n`;
      });
    }

    let arabicInstruction = "";
    if (subjectName.toLowerCase().includes('arab')) {
      arabicInstruction = `\n7. **Khat Arabic**: Khusus untuk mata pelajaran Bahasa Arab, semua kosakata, frasa, atau kalimat berbahasa Arab **WAJIB ditulis menggunakan tulisan/khat huruf Arab asli**, bukan latinnya. (Contoh: tulis كِتَابٌ bukan kitabun).`;
    }

    const prompt = `Tugas Anda adalah membuat ${questionCount} soal pilihan ganda berbahasa Indonesia untuk siswa Sekolah Dasar (SD) Kelas ${gradeLevel} (${faseMerdeka}) pada mata pelajaran ${subjectName} dengan topik "${moduleTitle}".
${existingQuestionsText}
Persyaratan Soal:
1. **Pendekatan & Kesesuaian Usia**: ${pedomanBahasa}
2. **Bahasa Interaktif**: Bahasa yang digunakan harus seperti bercerita, ramah anak, dan memancing rasa ingin tahu.
3. **Konteks Nyata**: Gunakan nama tokoh anak-anak, hewan peliharaan, atau situasi sehari-hari yang seru sebagai konteks soal. JANGAN gunakan bahasa teoritis kaku.
4. **Opsi Jawaban**: Opsi jawaban harus 4 pilihan (A, B, C, D) yang masuk akal. Pengecoh (distractor) harus dari kesalahan logika yang wajar, bukan sembarangan.
5. **Kalimat Positif**: Hindari pertanyaan "Berikut ini yang BUKAN..." atau "Kecuali".
6. **Penjelasan Mendidik**: Penjelasan harus ekstra menyenangkan, seperti kakak yang sedang mengajari adiknya dengan memberikan analogi sederhana!${arabicInstruction}

**INSTRUKSI TEKNIS:**
- correctIndex dimulai dari 0 (A=0, B=1, C=2, D=3).${levelInstructions}

Format Output WAJIB JSON murni (Array of Objects). Tanpa markdown \`\`\`json, tanpa teks pengantar.
**CONTOH STRUKTUR OUTPUT:**
[
  {
    "question": "Berapa hasil dari 5 + 3?",
    "options": ["6", "7", "8", "9"],
    "correctIndex": 2,
    "difficultyLevel": ${targetLevel === "all" ? 1 : targetLevel},
    "explanation": "5 ditambah 3 sama dengan 8. Bayangkan kamu punya 5 apel, lalu diberi 3 apel lagi, jadi totalnya 8 apel!"
  }
]
`;

    // 3. Call AI Provider
    const configs = await getAiConfigs();
    if (configs.length === 0) {
      return { ok: false, error: "Konfigurasi AI (API Key) belum diatur di Pengaturan sistem." };
    }

    let result;
    try {
      result = await callAiProvider(configs, prompt, { temperature: 0.7 });
    } catch (err) {
      return { ok: false, error: err instanceof AiClientError ? err.message : "Gagal menghubungi API AI." };
    }

    // 4. Parse AI Response
    let parsedQuestions: any[];
    try {
      const extracted = extractJson(result.content);
      if (!Array.isArray(extracted)) {
        throw new Error("Bukan array");
      }
      parsedQuestions = extracted;
    } catch (e) {
      console.error("AI JSON Parse Error:", result.content);
      return { ok: false, error: "Format respons dari AI tidak sesuai (Bukan JSON Array yang valid)." };
    }

    if (parsedQuestions.length === 0) {
      return { ok: false, error: "AI tidak mengembalikan soal sama sekali." };
    }

    // 5. Save to Database
    const baseSlug = `${subject.slug}-kelas-${gradeLevel}-${moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const moduleSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
    
    const createdModule = await prisma.module.create({
      data: {
        subjectId: subject.id,
        gradeLevel: gradeLevel,
        title: moduleTitle,
        slug: moduleSlug,
        isPublished: true,
        questions: {
          create: parsedQuestions.map(q => ({
            questionText: q.question,
            options: q.options || [],
            correctIndex: q.correctIndex || 0,
            difficultyLevel: targetLevel !== "all" ? targetLevel : (q.difficultyLevel || 1),
            explanation: q.explanation || ""
          }))
        }
      }
    });

    return { ok: true, moduleId: createdModule.id, slug: createdModule.slug };
  } catch (error: any) {
    console.error("Generate Quiz Error:", error);
    return { ok: false, error: error.message || "Terjadi kesalahan internal server." };
  }
}
