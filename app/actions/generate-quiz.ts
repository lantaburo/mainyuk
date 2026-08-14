"use server";

import { prisma } from "@/lib/prisma";
import { getAiConfigs } from "@/lib/ai-actions";
import { callAiProvider, extractJson, AiClientError } from "@/lib/ai-client";

export async function generateQuizModule(
  subjectName: string,
  gradeLevel: number,
  moduleTitle: string,
  questionCount: number
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
    const prompt = `Tugas Anda adalah membuat ${questionCount} soal pilihan ganda berbahasa Indonesia untuk siswa Sekolah Dasar (SD) kelas ${gradeLevel} pada mata pelajaran ${subjectName} dengan topik "${moduleTitle}".

Persyaratan Soal:
- Bahasa yang digunakan harus ramah anak, jelas, dan mudah dipahami.
- Opsi jawaban harus terdiri dari 4 pilihan (A, B, C, D).
- Penjelasan harus mendidik dan memberikan konteks mengapa jawaban tersebut benar dengan analogi yang cocok untuk anak-anak.

Format Output WAJIB JSON murni (Array of Objects). Tanpa markdown \`\`\`json, tanpa teks pengantar.
Contoh struktur yang diinginkan:
[
  {
    "question": "Berapa hasil dari 5 + 3?",
    "options": ["6", "7", "8", "9"],
    "correctIndex": 2,
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
