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
- Berikan \`difficultyLevel\` antara 1 hingga 5 (1 = Sangat Mudah, 5 = Sangat Sulit/HOTS).
- Distribusikan tingkat kesulitan secara merata dari Level 1 sampai 5. Walaupun level 5, pastikan bahasanya dan topiknya tetap sesuai dengan standar anak SD kelas ${moduleData.gradeLevel}.`;

  if (targetLevel !== "all") {
    levelInstructions = `
- Karena ini difokuskan pada Level ${targetLevel}, berikan \`difficultyLevel\` tepat ${targetLevel} untuk semua soal.
- Sesuaikan bobot kesulitan dengan Level ${targetLevel} (dimana 1 = Sangat Mudah, 3 = Sedang, 5 = Sangat Sulit/HOTS), namun bahasanya dan topiknya wajib tetap sesuai untuk anak SD kelas ${moduleData.gradeLevel}.`;
  }

  const prompt = `Tugas Anda adalah membuat ${count} soal pilihan ganda berbahasa Indonesia untuk siswa Sekolah Dasar (SD) kelas ${moduleData.gradeLevel} pada mata pelajaran ${moduleData.subject.name} dengan topik "${moduleData.title}".

Persyaratan Soal:
- Bahasa yang digunakan harus ramah anak, jelas, dan mudah dipahami.
- Opsi jawaban harus terdiri dari 4 pilihan (A, B, C, D).
- correctIndex dimulai dari 0 (A=0, B=1, C=2, D=3).${levelInstructions}
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

function makeSeedQuestions(subjectSlug: string, gradeLevel: number): SeedQ[] {
  const questions: SeedQ[] = [];
  for (let i = 0; i < 10; i++) {
    let qText = "";
    let opts: string[] = [];
    let explanation = "";

    if (subjectSlug === "matematika") {
      const variants = [
        [5 * gradeLevel, 3 * gradeLevel], [7 * gradeLevel, 2 * gradeLevel],
        [4 * gradeLevel, 6 * gradeLevel], [8 * gradeLevel, 1 * gradeLevel],
        [9 * gradeLevel, 4 * gradeLevel], [6 * gradeLevel, 3 * gradeLevel],
        [2 * gradeLevel, 7 * gradeLevel], [10 * gradeLevel, 5 * gradeLevel],
        [3 * gradeLevel, 8 * gradeLevel], [1 * gradeLevel, 9 * gradeLevel],
      ];
      const [a, b] = variants[i];
      const ans = a + b;
      qText = `Berapakah hasil dari ${a} + ${b}?`;
      opts = [String(ans), String(ans + 1), String(ans - 1), String(ans + 2)];
      explanation = `${a} + ${b} = ${ans}`;
    } else if (subjectSlug === "sains") {
      const bank = [
        { q: "Hewan yang menghasilkan madu adalah...", a: "Lebah", o: ["Semut", "Lalat", "Kupu-kupu"], e: "Lebah menghasilkan madu dari nektar bunga." },
        { q: "Nama planet yang kita tinggali adalah...", a: "Bumi", o: ["Mars", "Venus", "Jupiter"], e: "Kita tinggal di planet Bumi." },
        { q: "Air yang membeku akan menjadi...", a: "Es", o: ["Uap", "Hujan", "Awan"], e: "Air membeku pada suhu 0°C menjadi es." },
        { q: "Bagian tumbuhan yang menyerap air adalah...", a: "Akar", o: ["Daun", "Batang", "Bunga"], e: "Akar berfungsi menyerap air dan mineral dari tanah." },
        { q: "Ikan bernapas menggunakan...", a: "Insang", o: ["Paru-paru", "Kulit", "Hidung"], e: "Ikan bernapas dengan insang untuk menyerap oksigen dari air." },
        { q: "Matahari terbit di sebelah...", a: "Timur", o: ["Barat", "Selatan", "Utara"], e: "Matahari terbit di sebelah timur setiap pagi." },
        { q: "Hewan yang memiliki belalai adalah...", a: "Gajah", o: ["Jerapah", "Singa", "Harimau"], e: "Gajah memiliki belalai yang digunakan untuk makan dan minum." },
        { q: "Rasa air laut adalah...", a: "Asin", o: ["Manis", "Pahit", "Asam"], e: "Air laut terasa asin karena mengandung garam." },
        { q: "Proses tumbuhan membuat makanan disebut...", a: "Fotosintesis", o: ["Respirasi", "Transpirasi", "Reproduksi"], e: "Fotosintesis adalah proses tumbuhan membuat makanan dengan cahaya matahari." },
        { q: "Hewan yang hidup di dua alam disebut...", a: "Amfibi", o: ["Reptil", "Mamalia", "Aves"], e: "Amfibi seperti katak dapat hidup di darat dan air." },
      ];
      const b = bank[i]; qText = b.q; opts = [b.a, ...b.o]; explanation = b.e;
    } else if (subjectSlug === "geografi") {
      const bank = [
        { q: "Ibukota negara Indonesia adalah...", a: "Jakarta", o: ["Surabaya", "Bandung", "Medan"], e: "Jakarta adalah ibukota Republik Indonesia." },
        { q: "Benua terbesar di dunia adalah...", a: "Asia", o: ["Afrika", "Eropa", "Amerika"], e: "Asia adalah benua terbesar di dunia." },
        { q: "Negara yang dijuluki Negeri Sakura adalah...", a: "Jepang", o: ["Korea", "Cina", "Thailand"], e: "Jepang dijuluki Negeri Sakura karena banyak bunga sakura." },
        { q: "Candi Borobudur terletak di provinsi...", a: "Jawa Tengah", o: ["Jawa Timur", "Jawa Barat", "Bali"], e: "Candi Borobudur terletak di Magelang, Jawa Tengah." },
        { q: "Pulau Dewata adalah sebutan untuk pulau...", a: "Bali", o: ["Lombok", "Jawa", "Sumatera"], e: "Bali dijuluki Pulau Dewata karena kaya budaya Hindu." },
        { q: "Gunung tertinggi di dunia adalah...", a: "Gunung Everest", o: ["Gunung Semeru", "Gunung Rinjani", "Gunung Fuji"], e: "Gunung Everest setinggi 8.848 meter adalah tertinggi di dunia." },
        { q: "Lautan terluas di dunia adalah...", a: "Samudera Pasifik", o: ["Samudera Hindia", "Samudera Atlantik", "Samudera Arktik"], e: "Samudera Pasifik adalah lautan terluas di dunia." },
        { q: "Negara tetangga Indonesia di sebelah utara adalah...", a: "Malaysia", o: ["Australia", "India", "Filipina"], e: "Malaysia terletak di sebelah utara Indonesia." },
        { q: "Provinsi paling barat di Indonesia adalah...", a: "Aceh", o: ["Papua", "Jakarta", "Bali"], e: "Provinsi Aceh adalah provinsi paling barat Indonesia." },
        { q: "Ibukota provinsi Jawa Barat adalah...", a: "Bandung", o: ["Semarang", "Surabaya", "Yogyakarta"], e: "Bandung adalah ibukota provinsi Jawa Barat." },
      ];
      const b = bank[i]; qText = b.q; opts = [b.a, ...b.o]; explanation = b.e;
    } else if (subjectSlug === "bahasa-indonesia") {
      const bank = [
        { q: "Kata dasar dari 'berjalan' adalah...", a: "Jalan", o: ["Lari", "Maju", "Gerak"], e: "Kata 'berjalan' dari kata dasar 'jalan' dengan awalan ber-." },
        { q: "Antonim dari kata 'tinggi' adalah...", a: "Rendah", o: ["Kecil", "Pendek", "Besar"], e: "Lawan kata dari 'tinggi' adalah 'rendah'." },
        { q: "Sinonim dari kata 'pintar' adalah...", a: "Pandai", o: ["Bodoh", "Malas", "Kuat"], e: "Sinonim dari 'pintar' adalah 'pandai'." },
        { q: "Kalimat tanya diakhiri dengan tanda...", a: "Tanya (?)", o: ["Seru (!)", "Titik (.)", "Koma (,)"], e: "Kalimat tanya selalu diakhiri dengan tanda tanya (?)." },
        { q: "Orang yang menjalankan kereta api disebut...", a: "Masinis", o: ["Pilot", "Nahkoda", "Sopir"], e: "Masinis adalah orang yang mengemudikan kereta api." },
        { q: "Tempat meminjam buku di sekolah adalah...", a: "Perpustakaan", o: ["Kantin", "UKS", "Laboratorium"], e: "Perpustakaan adalah tempat menyimpan dan meminjam buku." },
        { q: "Lawan kata dari 'gelap' adalah...", a: "Terang", o: ["Suram", "Redup", "Buram"], e: "Lawan kata dari 'gelap' adalah 'terang'." },
        { q: "Hewan yang bersuara 'mengaum' adalah...", a: "Singa", o: ["Anjing", "Kucing", "Gajah"], e: "Singa bersuara mengaum." },
        { q: "Kata yang bermakna sama dengan 'senang' adalah...", a: "Gembira", o: ["Sedih", "Marah", "Kecewa"], e: "Gembira adalah sinonim dari kata senang." },
        { q: "Imbuhan 'me-' pada kata 'membaca' berfungsi membentuk...", a: "Kata kerja aktif", o: ["Kata sifat", "Kata benda", "Kata keterangan"], e: "Imbuhan 'me-' membentuk kata kerja aktif." },
      ];
      const b = bank[i]; qText = b.q; opts = [b.a, ...b.o]; explanation = b.e;
    } else if (subjectSlug === "bahasa-arab") {
      const bank = [
        { q: "Apa bahasa Arabnya 'buku'?", a: "كِتَابٌ (Kitabun)", o: ["قَلَمٌ (Qalamun)", "بَابٌ (Babun)", "مَكْتَبٌ (Maktabun)"], e: "Kitabun artinya buku dalam bahasa Arab." },
        { q: "Apa arti dari 'مَدْرَسَةٌ' (Madrasatun)?", a: "Sekolah", o: ["Rumah", "Pasar", "Masjid"], e: "Madrasatun artinya sekolah." },
        { q: "Apa bahasa Arabnya 'ayah'?", a: "أَبٌ (Abun)", o: ["أُمٌّ (Ummun)", "أَخٌ (Akhun)", "أُخْتٌ (Ukhtun)"], e: "Abun artinya ayah dalam bahasa Arab." },
        { q: "Angka 'wahidun' (وَاحِدٌ) artinya...", a: "Satu", o: ["Dua", "Tiga", "Empat"], e: "Wahidun adalah angka satu dalam bahasa Arab." },
        { q: "Apa bahasa Arabnya 'pintu'?", a: "بَابٌ (Babun)", o: ["نَافِذَةٌ (Nafidzatun)", "جِدَارٌ (Jidarun)", "سَقْفٌ (Saqfun)"], e: "Babun artinya pintu dalam bahasa Arab." },
        { q: "Apa arti dari 'قَلَمٌ' (Qalamun)?", a: "Pena/Pensil", o: ["Buku", "Meja", "Kursi"], e: "Qalamun artinya pena atau pensil." },
        { q: "Apa bahasa Arabnya 'masjid'?", a: "مَسْجِدٌ (Masjidun)", o: ["بَيْتٌ (Baitun)", "حَدِيقَةٌ (Hadiqotun)", "سُوقٌ (Suqun)"], e: "Masjidun artinya masjid." },
        { q: "Angka 'itsnani' (اِثْنَانِ) artinya...", a: "Dua", o: ["Satu", "Tiga", "Empat"], e: "Itsnani adalah angka dua dalam bahasa Arab." },
        { q: "Apa arti dari 'كُرْسِيٌّ' (Kursiyyun)?", a: "Kursi", o: ["Meja", "Papan Tulis", "Lemari"], e: "Kursiyyun artinya kursi." },
        { q: "Apa bahasa Arabnya 'guru (laki-laki)'?", a: "مُدَرِّسٌ (Mudarrisun)", o: ["طَالِبٌ (Thalibun)", "طَبِيبٌ (Thabibun)", "مُهَنْدِسٌ (Muhandisun)"], e: "Mudarrisun artinya guru laki-laki." },
      ];
      const b = bank[i]; qText = b.q; opts = [b.a, ...b.o]; explanation = b.e;
    } else {
      const bank = [
        { q: "Nabi terakhir yang diutus Allah SWT adalah...", a: "Nabi Muhammad SAW", o: ["Nabi Musa AS", "Nabi Isa AS", "Nabi Ibrahim AS"], e: "Nabi Muhammad SAW adalah nabi dan rasul terakhir." },
        { q: "Kitab suci umat Islam adalah...", a: "Al-Qur'an", o: ["Taurat", "Zabur", "Injil"], e: "Al-Qur'an adalah kitab suci umat Islam." },
        { q: "Shalat fardhu sehari semalam berjumlah... waktu", a: "Lima", o: ["Tiga", "Empat", "Enam"], e: "Shalat fardhu ada 5 waktu: Subuh, Dzuhur, Ashar, Maghrib, Isya." },
        { q: "Puasa wajib umat Islam dilaksanakan pada bulan...", a: "Ramadhan", o: ["Syawal", "Rajab", "Muharram"], e: "Puasa Ramadhan wajib dilaksanakan selama sebulan penuh." },
        { q: "Ibadah haji dilaksanakan di kota...", a: "Makkah", o: ["Madinah", "Yerusalem", "Kairo"], e: "Ibadah haji dilaksanakan di Makkah Al-Mukarramah." },
        { q: "Malaikat yang menyampaikan wahyu adalah...", a: "Malaikat Jibril", o: ["Malaikat Mikail", "Malaikat Israfil", "Malaikat Izrail"], e: "Malaikat Jibril bertugas menyampaikan wahyu kepada para nabi." },
        { q: "Rukun Islam yang pertama adalah...", a: "Syahadat", o: ["Shalat", "Zakat", "Puasa"], e: "Syahadat adalah rukun Islam pertama." },
        { q: "Surah pertama dalam Al-Qur'an adalah...", a: "Al-Fatihah", o: ["Al-Baqarah", "Yasin", "Al-Ikhlas"], e: "Surah Al-Fatihah adalah surah pertama dalam Al-Qur'an." },
        { q: "Khalifah pertama setelah Rasulullah wafat adalah...", a: "Abu Bakar As-Siddiq", o: ["Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"], e: "Abu Bakar As-Siddiq adalah khalifah pertama." },
        { q: "Sifat wajib Allah yang berarti 'Maha Mengetahui' adalah...", a: "'Alim", o: ["Qadir", "Sami'", "Bashir"], e: "'Alim berarti Maha Mengetahui segala sesuatu." },
      ];
      const b = bank[i]; qText = b.q; opts = [b.a, ...b.o]; explanation = b.e;
    }

    const correctAns = opts[0];
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    questions.push({ questionText: qText, options: shuffled, correctIndex: shuffled.indexOf(correctAns), difficultyLevel: 1, explanation });
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
          const qs = makeSeedQuestions(sub.slug, grade);
          await prisma.question.createMany({ data: qs.map((q) => ({ moduleId: mod!.id, ...q })) });
          totalQuestions += qs.length;
        }
      }
    }
  }

  revalidatePath("/admin/curriculum");
  return { ok: true, totalSubjects, totalModules, totalQuestions };
}
