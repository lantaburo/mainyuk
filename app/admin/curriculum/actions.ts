"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { getAiConfigs } from "@/lib/ai-actions";
import { callAiProvider, extractJson, AiClientError } from "@/lib/ai-client";

// ── Create Subject ────────────────────────────────────────────────────────────

export async function createSubject(data: {
  name: string;
  slug: string;
  color?: string;
}) {
  await requireAdmin();

  if (!data.name.trim() || !data.slug.trim()) {
    return { ok: false, error: "Nama dan slug wajib diisi." };
  }

  const existing = await prisma.subject.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { ok: false, error: "Slug sudah digunakan, coba yang lain." };
  }

  await prisma.subject.create({
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      color: data.color?.trim() || null,
    },
  });

  revalidatePath("/admin/curriculum");
  return { ok: true };
}

// ── Create Module ─────────────────────────────────────────────────────────────

export async function createModule(data: {
  subjectId: string;
  gradeLevel: number;
  title: string;
  slug: string;
  description?: string;
  isPremium: boolean;
  price?: number | null;
}) {
  await requireAdmin();

  if (!data.title.trim() || !data.slug.trim()) {
    return { ok: false, error: "Judul dan slug wajib diisi." };
  }

  const existing = await prisma.module.findFirst({
    where: { subjectId: data.subjectId, slug: data.slug },
  });
  if (existing) {
    return { ok: false, error: "Slug sudah digunakan di mapel ini, coba yang lain." };
  }

  const mod = await prisma.module.create({
    data: {
      subjectId: data.subjectId,
      gradeLevel: data.gradeLevel,
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || null,
      isPremium: data.isPremium,
      price: data.isPremium && data.price ? data.price : null,
      isPublished: false,
    },
  });

  revalidatePath("/admin/curriculum");
  return { ok: true, moduleId: mod.id };
}

// ── Create Question ───────────────────────────────────────────────────────────

export async function createQuestion(data: {
  moduleId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  difficultyLevel: number;
  explanation?: string;
}) {
  await requireAdmin();

  if (!data.questionText.trim()) {
    return { ok: false, error: "Teks soal wajib diisi." };
  }
  if (data.options.length !== 4 || data.options.some((o) => !o.trim())) {
    return { ok: false, error: "Semua 4 opsi jawaban wajib diisi." };
  }
  if (data.correctIndex < 0 || data.correctIndex > 3) {
    return { ok: false, error: "Pilih jawaban yang benar." };
  }

  await prisma.question.create({
    data: {
      moduleId: data.moduleId,
      questionText: data.questionText.trim(),
      options: data.options.map((o) => o.trim()),
      correctIndex: data.correctIndex,
      difficultyLevel: data.difficultyLevel,
      explanation: data.explanation?.trim() || null,
    },
  });

  revalidatePath("/admin/curriculum");
  return { ok: true };
}

// ── Delete Question ───────────────────────────────────────────────────────────

export async function deleteQuestion(questionId: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath("/admin/curriculum");
  return { ok: true };
}

export async function generateQuestionsForModule(moduleId: string, count: number, targetLevel: number | "all" = "all") {
  await requireAdmin();

  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { subject: true }
  });

  if (!moduleData) {
    return { ok: false, error: "Modul tidak ditemukan." };
  }

  let levelInstructions = `
- Berikan \`difficultyLevel\` antara 1 hingga 5 (1 = Pemahaman Dasar, 5 = HOTS/Penalaran Kritis).
- Distribusikan tingkat kesulitan secara merata.`;

  if (targetLevel !== "all") {
    levelInstructions = `
- Berikan \`difficultyLevel\` tepat ${targetLevel} untuk semua soal. (1=Pemahaman Dasar, 3=Penerapan, 5=HOTS/Penalaran Kritis).`;
  }

  // Tentukan fase Kurikulum Merdeka
  const grade = moduleData.gradeLevel;
  let faseMerdeka = "";
  let pedomanBahasa = "";
  
  if (grade <= 2) {
    faseMerdeka = "Fase A (Kelas 1-2 SD)";
    pedomanBahasa = "Gunakan kalimat sangat pendek, kosakata sehari-hari yang sangat sederhana, hindari kalimat majemuk bertingkat. Fokus pada pengamatan konkret, cerita hewan, benda sekitar, dan literasi dasar.";
  } else if (grade <= 4) {
    faseMerdeka = "Fase B (Kelas 3-4 SD)";
    pedomanBahasa = "Gunakan kalimat yang mudah dicerna, mulai perkenalkan konsep sebab-akibat sederhana. Cerita bisa sedikit lebih kompleks tapi tetap membumi pada kehidupan nyata siswa.";
  } else {
    faseMerdeka = "Fase C (Kelas 5-6 SD)";
    pedomanBahasa = "Gunakan paragraf pendek yang melatih literasi membaca. Perkenalkan istilah ilmiah dasar, analisis masalah, logika kritis (HOTS), dan pemecahan masalah (Problem Solving) sesuai standar AKM (Asesmen Kompetensi Minimum).";
  }

  const prompt = `Anda adalah seorang ahli penyusun soal evaluasi pendidikan berdasarkan standar **Kurikulum Merdeka**.
Tugas Anda adalah membuat ${count} soal pilihan ganda berbahasa Indonesia untuk siswa Sekolah Dasar (SD) **Kelas ${grade} (${faseMerdeka})**.
Mata Pelajaran: ${moduleData.subject.name}
Topik/Materi: "${moduleData.title}"

**PEDOMAN PENYUSUNAN SOAL KURIKULUM MERDEKA:**
1. **Pendekatan:** Soal tidak boleh sekadar hafalan murni (C1). Gunakan cerita naratif pendek yang interaktif, studi kasus kehidupan sehari-hari, atau teka-teki yang menyenangkan bagi anak. JANGAN buat soal teoritis kaku.
2. **Kesesuaian Usia:** ${pedomanBahasa}
3. **Struktur Jawaban:** Opsi jawaban harus 4 pilihan yang masuk akal dan panjangnya setara. Pengecoh (distractor) HARUS berupa kesalahan umum yang sering dipikirkan anak, BUKAN teks asal-asalan. DILARANG keras menggunakan opsi "Semua jawaban benar" atau "Kecuali".
4. **Kalimat Positif:** Gunakan kalimat tanya yang positif dan jelas. Hindari jebakan kata "yang bukan" atau "kecuali".
5. **Pembahasan:** Penjelasan (explanation) harus ekstra menyenangkan, gunakan gaya bahasa seperti kakak pembina atau guru ramah yang sedang bercerita, dan pastikan memotivasi anak!

**INSTRUKSI TEKNIS:**
- correctIndex dimulai dari 0 (A=0, B=1, C=2, D=3).${levelInstructions}

Format Output WAJIB JSON murni (Array of Objects). Tanpa blok markdown \`\`\`json, tanpa teks pengantar, langsung dimulai dengan kurung siku buka '['.
[
  {
    "question": "Cerita singkat atau pertanyaan soal...",
    "options": ["Opsi 1", "Opsi 2", "Opsi 3", "Opsi 4"],
    "correctIndex": 0,
    "difficultyLevel": 3,
    "explanation": "Penjelasan mendidik dengan bahasa sesuai anak Kelas ${grade}."
  }
]`;

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

  let parsedQuestions: any[];
  try {
    const extracted = extractJson(result.content);
    if (!Array.isArray(extracted)) throw new Error("Bukan array");
    parsedQuestions = extracted;
  } catch {
    return { ok: false, error: "Format respons AI tidak sesuai. Silakan coba lagi." };
  }

  if (parsedQuestions.length === 0) {
    return { ok: false, error: "AI tidak mengembalikan soal apapun." };
  }

  await prisma.question.createMany({
    data: parsedQuestions.map(q => ({
      moduleId,
      questionText: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      difficultyLevel: targetLevel !== "all" ? targetLevel : (q.difficultyLevel || 1),
      explanation: q.explanation || null,
    }))
  });

  revalidatePath(`/admin/curriculum`);
  return { ok: true, count: parsedQuestions.length };
}

export async function updateModuleSettings(
  moduleId: string,
  data: {
    isPremium: boolean;
    price: number | null;
    isPublished: boolean;
    title: string;
    slug: string;
    description: string;
  }
) {
  await requireAdmin();

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      isPremium: data.isPremium,
      price: data.isPremium && data.price ? data.price : null,
      isPublished: data.isPublished,
      title: data.title,
      slug: data.slug,
      description: data.description,
    }
  });

  revalidatePath(`/admin/curriculum`);
  return { ok: true };
}

export async function deleteSubject(subjectId: string) {
  await requireAdmin();
  await prisma.subject.delete({ where: { id: subjectId } });
  revalidatePath("/admin/curriculum");
  return { ok: true };
}

export async function deleteModule(moduleId: string) {
  await requireAdmin();
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath("/admin/curriculum");
  return { ok: true };
}

// ── Seed Curriculum ──────────────────────────────────────────────────────────

const SEED_SUBJECTS = [
  { name: "Matematika", slug: "matematika", color: "#3b82f6" },
  { name: "Sains", slug: "sains", color: "#10b981" },
  { name: "Geografi", slug: "geografi", color: "#f59e0b" },
  { name: "Bahasa Indonesia", slug: "bahasa-indonesia", color: "#ef4444" },
  { name: "Bahasa Arab", slug: "bahasa-arab", color: "#8b5cf6" },
  { name: "Tsaqofah", slug: "tsaqofah", color: "#06b6d4" },
];

type SeedQ = { questionText: string; options: string[]; correctIndex: number; difficultyLevel: number; explanation: string };

function makeSeedQuestions(subjectSlug: string, gradeLevel: number, moduleIndex: number): SeedQ[] {
  const questions: SeedQ[] = [];
  
  for (let i = 1; i <= 10; i++) {
    let qText = "";
    let opts: string[] = [];
    let explanation = "";

    const baseNum = (gradeLevel * 10) + moduleIndex + i;

    if (subjectSlug === "matematika") {
      const a = baseNum;
      const b = gradeLevel * i;
      const ans = a + b;
      qText = `Pada pelajaran Modul ${moduleIndex} Kelas ${gradeLevel}, berapakah hasil dari ${a} + ${b}?`;
      opts = [String(ans), String(ans + 1), String(ans - 1), String(ans + 2)];
      explanation = `${a} + ${b} = ${ans}`;
    } else if (subjectSlug === "sains") {
      qText = `Topik Sains Modul ${moduleIndex} Kelas ${gradeLevel}: Hewan atau benda nomor ${baseNum} di buku adalah...`;
      opts = [`Jawaban Benar ${baseNum}`, `Salah A ${baseNum}`, `Salah B ${baseNum}`, `Salah C ${baseNum}`];
      explanation = `Sesuai dengan materi sains kelas ${gradeLevel} modul ${moduleIndex}.`;
    } else if (subjectSlug === "geografi") {
      qText = `Geografi Kelas ${gradeLevel} Modul ${moduleIndex}: Wilayah dengan kode area ${baseNum} terletak di...`;
      opts = [`Zona ${baseNum}`, `Zona ${baseNum+1}`, `Zona ${baseNum+2}`, `Zona ${baseNum+3}`];
      explanation = `Wilayah tersebut masuk ke dalam zona utama pelajaran geografi kelas ${gradeLevel}.`;
    } else if (subjectSlug === "bahasa-indonesia") {
      qText = `Bahasa Indonesia Kelas ${gradeLevel} Modul ${moduleIndex}: Kalimat contoh ke-${i} yang paling tepat adalah...`;
      opts = [`Kalimat Benar ${i}`, `Kalimat Salah A ${i}`, `Kalimat Salah B ${i}`, `Kalimat Salah C ${i}`];
      explanation = `Struktur kalimat yang benar diajarkan di modul ${moduleIndex} kelas ${gradeLevel}.`;
    } else if (subjectSlug === "bahasa-arab") {
      qText = `Pelajaran Bahasa Arab Kelas ${gradeLevel} Modul ${moduleIndex}: Kosa kata nomor ${i} adalah...`;
      opts = [`Mufradat ${i}`, `Khatam ${i}`, `Khabar ${i}`, `Mubtada ${i}`];
      explanation = `Mufradat ini adalah bagian dari hafalan kelas ${gradeLevel} modul ${moduleIndex}.`;
    } else {
      qText = `Tsaqofah Kelas ${gradeLevel} Modul ${moduleIndex}: Pelajaran sejarah ke-${i} menyebutkan bahwa...`;
      opts = [`Fakta Benar ${i}`, `Fakta Salah A ${i}`, `Fakta Salah B ${i}`, `Fakta Salah C ${i}`];
      explanation = `Fakta sejarah ini sesuai dengan kurikulum tsaqofah kelas ${gradeLevel}.`;
    }

    const correctAns = opts[0];
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    questions.push({ 
      questionText: qText, 
      options: shuffled, 
      correctIndex: shuffled.indexOf(correctAns), 
      difficultyLevel: 1, 
      explanation 
    });
  }
  return questions;
}

export async function seedCurriculum() {
  await requireAdmin();

  let totalSubjects = 0, totalModules = 0, totalQuestions = 0;

  for (const sub of SEED_SUBJECTS) {
    let subject = await prisma.subject.findUnique({ where: { slug: sub.slug } });
    if (!subject) {
      subject = await prisma.subject.create({ data: { name: sub.name, slug: sub.slug, color: sub.color } });
      totalSubjects++;
    }

    for (let grade = 1; grade <= 6; grade++) {
      for (let m = 1; m <= 5; m++) {
        const slug = `${sub.slug}-k${grade}-m${m}`;
        let mod = await prisma.module.findFirst({ where: { subjectId: subject.id, slug } });

        if (!mod) {
          mod = await prisma.module.create({
            data: {
              subjectId: subject.id,
              gradeLevel: grade,
              title: `Modul ${m} ${sub.name} Kelas ${grade}`,
              slug,
              description: `Materi dasar ${sub.name} Kelas ${grade} Modul ${m}.`,
              isPublished: true,
              isPremium: false,
            },
          });
          totalModules++;
        }

        const questionCount = await prisma.question.count({ where: { moduleId: mod.id } });
        if (questionCount === 0) {
          const qs = makeSeedQuestions(sub.slug, grade, m);
          await prisma.question.createMany({ data: qs.map((q) => ({ moduleId: mod!.id, ...q })) });
          totalQuestions += qs.length;
        }
      }
    }
  }

  revalidatePath("/admin/curriculum");
  return { ok: true, totalSubjects, totalModules, totalQuestions };
}
