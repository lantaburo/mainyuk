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

export async function generateQuestionsForModule(moduleId: string, count: number) {
  await requireAdmin();

  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { subject: true }
  });

  if (!moduleData) {
    return { ok: false, error: "Modul tidak ditemukan." };
  }

  const prompt = `Tugas Anda adalah membuat ${count} soal pilihan ganda berbahasa Indonesia untuk siswa Sekolah Dasar (SD) kelas ${moduleData.gradeLevel} pada mata pelajaran ${moduleData.subject.name} dengan topik "${moduleData.title}".

Persyaratan Soal:
- Bahasa yang digunakan harus ramah anak, jelas, dan mudah dipahami.
- Opsi jawaban harus terdiri dari 4 pilihan (A, B, C, D).
- correctIndex dimulai dari 0 (A=0, B=1, C=2, D=3).
- Berikan \`difficultyLevel\` antara 1 hingga 5 (1 = Sangat Mudah, 5 = Sangat Sulit/HOTS).
- Distribusikan tingkat kesulitan secara merata dari Level 1 sampai 5. Walaupun level 5, pastikan bahasanya dan topiknya tetap sesuai dengan standar anak SD kelas ${moduleData.gradeLevel}.
- Penjelasan harus mendidik dan sesuai kemampuan anak kelas ${moduleData.gradeLevel} SD.

Format Output WAJIB JSON murni (Array of Objects). Tanpa markdown \`\`\`json, tanpa teks pengantar.
[
  {
    "question": "Pertanyaan soal",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "correctIndex": 0,
    "difficultyLevel": 3,
    "explanation": "Penjelasan singkat mengapa jawabannya benar."
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
      difficultyLevel: q.difficultyLevel || 1,
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
