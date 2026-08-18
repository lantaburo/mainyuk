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

// ── Update Question ───────────────────────────────────────────────────────────

export async function updateQuestion(data: {
  questionId: string;
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

  await prisma.question.update({
    where: { id: data.questionId },
    data: {
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

export async function deleteBulkQuestions(questionIds: string[]) {
  await requireAdmin();
  
  if (!questionIds || questionIds.length === 0) {
    return { ok: false, error: "Tidak ada soal yang dipilih." };
  }

  await prisma.question.deleteMany({
    where: { id: { in: questionIds } }
  });

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

  // Ambil daftar soal yang sudah ada agar tidak diulang
  const existingQuestions = await prisma.question.findMany({
    where: { 
      module: { 
        subjectId: moduleData.subjectId,
        gradeLevel: grade 
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

  // Fetch Dynamic AI Skills
  const activeSkills = await prisma.aiSkillVersion.findMany({
    where: { isActive: true },
    include: { skill: true }
  });
  
  let dynamicSkillsText = "";
  if (activeSkills.length > 0) {
    dynamicSkillsText = "\n\n**INSTRUKSI KHUSUS (SKILL SETS):**\n" + 
      activeSkills.map((s, i) => `${i + 1}. [${s.skill.name}]: ${s.content}`).join("\n");
  }

  // Fetch AI Documents (Global + Subject Specific)
  const aiDocuments = await prisma.aiDocument.findMany({
    where: {
      OR: [
        { subjectId: null },
        { subjectId: moduleData.subjectId }
      ]
    }
  });

  let documentsText = "";
  if (aiDocuments.length > 0) {
    documentsText = "\n\n**DOKUMEN REFERENSI (RAG):**\nAnda WAJIB menggunakan informasi dari dokumen berikut sebagai referensi utama pembuatan soal:\n" + 
      aiDocuments.map((doc, i) => `--- DOKUMEN ${i+1}: ${doc.title} ---\n${doc.extractedText || ""}\n-------------------`).join("\n\n");
  }

  const prompt = `Anda adalah seorang ahli penyusun soal evaluasi pendidikan berdasarkan standar **Kurikulum Merdeka**.
Tugas Anda adalah membuat ${count} soal pilihan ganda yang BENAR-BENAR FOKUS pada spesifikasi berikut:

**SPESIFIKASI SOAL (ADAPTIF & WAJIB DIIKUTI):**
- **Kelas:** ${grade} SD (${faseMerdeka})
- **Mata Pelajaran:** ${moduleData.subject.name} (Soal HARUS MURNI tentang mata pelajaran ini. Jangan sampai membuat soal Matematika untuk pelajaran Bahasa Indonesia, dst).
- **Topik/Modul:** "${moduleData.title}" (Seluruh soal HARUS secara spesifik menguji pemahaman tentang topik ini, disesuaikan dengan kapasitas nalar Kelas ${grade}).

${existingQuestionsText}
**PEDOMAN PENYUSUNAN SOAL KURIKULUM MERDEKA:**
1. **Pendekatan & Diferensiasi Kelas:** Soal tidak boleh sekadar hafalan murni (C1). Gunakan cerita naratif pendek yang interaktif, studi kasus, atau teka-teki. **Tingkat kesulitan dan gaya bahasa WAJIB sangat berbeda antar kelas!** (Soal Kelas 1 harus jauh lebih simpel dari Kelas 6).
2. **Kesesuaian Usia:** ${pedomanBahasa}
3. **Struktur Jawaban (Randomize):** Opsi jawaban harus 4 pilihan yang masuk akal. Pengecoh (distractor) HARUS berupa kesalahan umum anak. **PENTING: Letak kunci jawaban yang benar (correctIndex) HARUS diacak secara merata (tidak boleh selalu A atau 0 terus menerus).** DILARANG keras menggunakan opsi "Semua jawaban benar".
4. **Keberagaman & Anti-Pengulangan:** Setiap soal yang Anda buat HARUS unik. Dilarang keras mengulang pola soal, nama tokoh, atau konteks cerita yang sama secara berulang.
5. **Kalimat Positif:** Gunakan kalimat tanya yang positif dan jelas. Hindari jebakan kata "yang bukan" atau "kecuali".
6. **Pembahasan:** Penjelasan (explanation) harus ekstra menyenangkan, gunakan gaya bahasa seperti kakak pembina atau guru ramah yang sedang bercerita, dan pastikan memotivasi anak!${dynamicSkillsText}${documentsText}

**INSTRUKSI TEKNIS:**
- correctIndex dimulai dari 0 (A=0, B=1, C=2, D=3). Pastikan terdistribusi acak (misal 1, 3, 0, 2, dll).${levelInstructions}

Format Output WAJIB JSON murni (Array of Objects). Tanpa blok markdown \`\`\`json, tanpa teks pengantar, langsung dimulai dengan kurung siku buka '['.
**CONTOH STRUKTUR OUTPUT:**
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

  try {
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
  } catch (dbError: any) {
    console.error("[generateQuestionsForModule] DB Error:", dbError);
    return { ok: false, error: "Gagal menyimpan soal ke database. Mungkin struktur database belum sinkron. " + (dbError.message || "") };
  }

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
  
  // Variabel agar soal tidak pernah sama
  const names = ["Andi", "Siti", "Budi", "Lina", "Edo", "Lani", "Dayu", "Udin", "Beni", "Meli"];
  const fruits = ["apel", "jeruk", "mangga", "pisang", "anggur", "semangka", "melon", "pepaya", "nanas", "stroberi"];
  const animals = ["kucing", "anjing", "burung", "ikan", "kelinci", "ayam", "bebek", "kuda", "sapi", "kambing"];
  const locations = ["di taman", "di sekolah", "di perpustakaan", "di pasar", "di rumah", "di lapangan", "di pegunungan", "di pantai", "di museum", "di kebun binatang"];

  for (let i = 1; i <= 10; i++) {
    let qText = "";
    let opts: string[] = [];
    let explanation = "";

    // Modifier unik per soal
    const n = names[(moduleIndex + i) % names.length];
    const n2 = names[(moduleIndex + i + 1) % names.length];
    const f = fruits[(gradeLevel + i) % fruits.length];
    const a = animals[(gradeLevel + moduleIndex + i) % animals.length];
    const loc = locations[(gradeLevel * moduleIndex + i) % locations.length];
    const num1 = gradeLevel * 2 + i;
    const num2 = moduleIndex + i;

    // Kesulitan berdasarkan kelas (Fase A, B, C)
    const isFaseA = gradeLevel <= 2;
    const isFaseB = gradeLevel === 3 || gradeLevel === 4;
    const isFaseC = gradeLevel >= 5;

    if (subjectSlug === "matematika") {
      if (isFaseA) {
        qText = `${n} memiliki ${num1} buah ${f}. Kemudian, ${n2} memberinya ${num2} buah ${f} lagi. Berapa total ${f} milik ${n} sekarang?`;
        opts = [String(num1 + num2), String(num1 + num2 - 1), String(num1 + num2 + 1), String(num1 + num2 + 2)];
        explanation = `Penjumlahan sederhana: ${num1} + ${num2} = ${num1 + num2}. Total buahnya menjadi ${num1 + num2}.`;
      } else if (isFaseB) {
        qText = `Pak ${n} memanen ${num1 * 12} ${f} dari kebunnya. Ia ingin membagikan buah tersebut ke dalam ${num2} keranjang secara merata. Berapa perkiraan jumlah ${f} di setiap keranjang?`;
        const ans = Math.floor((num1 * 12) / num2);
        opts = [String(ans), String(ans + 2), String(ans - 2), String(ans + 5)];
        explanation = `Ini adalah konsep pembagian. Total buah dibagi jumlah keranjang: ${num1 * 12} ÷ ${num2} = ${ans}.`;
      } else {
        qText = `${loc}, ${n} membeli barang seharga Rp${num1 * 5000}. Jika ia mendapat diskon ${num2}%, berapa uang yang harus ia bayar?`;
        const discount = ((num1 * 5000) * num2) / 100;
        const ans = (num1 * 5000) - discount;
        opts = [`Rp${ans}`, `Rp${ans + 1000}`, `Rp${ans - 1000}`, `Rp${ans + 2500}`];
        explanation = `Diskon = ${num2}% dari Rp${num1 * 5000} yaitu Rp${discount}. Harga akhir: Rp${num1 * 5000} - Rp${discount} = Rp${ans}. Ini melatih logika persentase HOTS.`;
      }
    } else if (subjectSlug === "sains") {
      if (isFaseA) {
        qText = `${n} melihat seekor ${a} ${loc}. Ciri utama hewan tersebut agar bisa bertahan hidup adalah...`;
        opts = [`Memiliki tubuh yang sesuai habitatnya`, `Bisa berbicara seperti manusia`, `Selalu bersembunyi di dalam tanah`, `Hanya makan rumput kering`];
        explanation = `Setiap makhluk hidup memiliki ciri khusus yang menyesuaikan dengan habitatnya untuk bertahan hidup.`;
      } else if (isFaseB) {
        qText = `Saat melakukan pengamatan ${loc}, ${n2} menyadari perubahan wujud benda. Manakah contoh perubahan wujud yang membutuhkan kalor terbesar?`;
        opts = [`Mencair dan menguap`, `Membeku dan mengembun`, `Menyublim dan membeku`, `Menguap dan mengembun`];
        explanation = `Mencair (padat ke cair) dan menguap (cair ke gas) membutuhkan serapan kalor (panas) agar prosesnya terjadi.`;
      } else {
        qText = `Perhatikan rantai makanan ${loc}! Jika populasi ${a} tiba-tiba menurun drastis karena perburuan, dampak ekosistem tingkat lanjut (HOTS) yang paling logis adalah...`;
        opts = [`Konsumen tingkat berikutnya akan kekurangan makanan dan populasinya menurun`, `Produsen akan mati semua`, `Ekosistem akan menjadi lebih stabil`, `Konsumen tingkat pertama akan mencari habitat lain secara serentak`];
        explanation = `Penurunan mendadak pada satu rantai makanan akan langsung berdampak pada konsumen di atasnya (kekurangan mangsa) dan peningkatan populasi di bawahnya.`;
      }
    } else if (subjectSlug === "bahasa-indonesia") {
      if (isFaseA) {
        qText = `Bacalah kalimat ini: "${n} sedang bermain bola ${loc}." Siapa yang sedang bermain bola?`;
        opts = [n, n2, "Ayah", "Ibu"];
        explanation = `Berdasarkan kalimat pendek tersebut, subjek yang melakukan kegiatan adalah ${n}.`;
      } else if (isFaseB) {
        qText = `Teks: ${n} rajin menabung setiap hari. Ia ingin membeli tas baru. Amanat yang tepat dari cerita tersebut adalah...`;
        opts = [`Kita harus berhemat dan rajin menabung untuk mencapai tujuan`, `Meminta uang kepada orang tua adalah cara terbaik`, `Menabung membuat kita kaya raya seketika`, `Tas baru hanya bisa dibeli jika harganya murah`];
        explanation = `Amanat atau pesan moral dari kebiasaan ${n} adalah pentingnya berhemat dan menabung untuk membeli sesuatu yang diimpikan.`;
      } else {
        qText = `(HOTS) "Angin berhembus kencang, menyapu dedaunan kering yang berserakan ${loc}." Majas yang terdapat pada kalimat tersebut adalah...`;
        opts = [`Personifikasi`, `Hiperbola`, `Metafora`, `Litotes`];
        explanation = `Kata 'menyapu' yang dilakukan oleh angin seolah memberikan sifat manusia (bisa menyapu) pada benda mati, sehingga disebut majas personifikasi.`;
      }
    } else if (subjectSlug === "bahasa-arab") {
      const isms = ["كِتَابٌ", "قَلَمٌ", "بَابٌ", "نَافِذَةٌ", "مَكْتَبٌ", "كُرْسِيٌّ", "سَبُّورَةٌ", "مَدْرَسَةٌ"];
      const hruf = ["فِي", "عَلَى", "مِنْ", "إِلَى"];
      const arab_w = isms[(moduleIndex + i) % isms.length];
      const h = hruf[i % hruf.length];

      if (isFaseA) {
        qText = `Apa arti dari kata bahasa Arab berikut ini: ${arab_w} ?`;
        opts = [`Sesuai kosakata ke-${i}`, `Salah arti A`, `Salah arti B`, `Salah arti C`];
        explanation = `Kata ${arab_w} adalah kosakata dasar (mufradat) yang wajib dihafal pada fase ini.`;
      } else if (isFaseB) {
        qText = `Lengkapi kalimat berikut: الْقَلَمُ ... الْمَكْتَبِ (${h})`;
        opts = [h, hruf[(i+1)%hruf.length], hruf[(i+2)%hruf.length], hruf[(i+3)%hruf.length]];
        explanation = `Penggunaan huruf jar yang tepat akan membariskan kata setelahnya menjadi majrur (kasrah).`;
      } else {
        qText = `Susunlah kalimat berikut menjadi jumlah mufidah: ${arab_w} - هَذَا - جَمِيلٌ`;
        opts = [`هَذَا ${arab_w} جَمِيلٌ`, `جَمِيلٌ هَذَا ${arab_w}`, `${arab_w} هَذَا جَمِيلٌ`, `هَذَا جَمِيلٌ ${arab_w}`];
        explanation = `Susunan yang benar untuk Mubtada dan Khabar yang sesuai dengan kaidah tata bahasa Arab.`;
      }
    } else if (subjectSlug === "geografi") {
      if (isFaseA) {
        qText = `Tempat yang banyak pohon, hewan, dan udaranya sejuk biasanya disebut...`;
        opts = [`Hutan atau Pegunungan`, `Perkotaan`, `Pabrik`, `Jalan Raya`];
        explanation = `Pengenalan lingkungan sekitar yang mendasar untuk kelas rendah.`;
      } else if (isFaseB) {
        qText = `Penduduk yang tinggal ${loc} mayoritas bekerja sebagai...`;
        opts = [`Tergantung kondisi alamnya (Petani/Nelayan)`, `Pegawai Bank`, `Pilot Pesawat`, `Semua jawaban benar`];
        explanation = `Kondisi geografis sangat mempengaruhi mata pencaharian penduduk di daerah tersebut.`;
      } else {
        qText = `Pergerakan lempeng tektonik di wilayah nomor ${num1} sering memicu fenomena...`;
        opts = [`Gempa bumi dan vulkanisme`, `Hujan salju ekstrem`, `Kekeringan berkepanjangan`, `Angin puting beliung harian`];
        explanation = `HOTS Geografi: Lempeng tektonik yang saling bertabrakan melepaskan energi berupa gempa bumi.`;
      }
    } else {
      // Tsaqofah
      if (isFaseA) {
        qText = `Saat bertemu dengan guru ${loc}, apa yang sebaiknya ${n} lakukan?`;
        opts = [`Mengucapkan salam dan tersenyum`, `Berpura-pura tidak melihat`, `Berlari menjauh`, `Diam saja menunduk`];
        explanation = `Adab kepada guru adalah mengucapkan salam dan bersikap sopan.`;
      } else if (isFaseB) {
        qText = `Kisah teladan nomor ${num2} mengajarkan kita bahwa sikap jujur akan membawa...`;
        opts = [`Ketenangan hati dan kepercayaan orang lain`, `Banyak masalah baru`, `Kemiskinan`, `Kebencian dari teman`];
        explanation = `Kejujuran adalah pondasi akhlak (tsaqofah) yang selalu diajarkan oleh para tokoh sejarah Islam.`;
      } else {
        qText = `(HOTS) ${n} menemukan uang di jalan saat berjalan ${loc}. Sesuai fikih/tsaqofah, langkah paling tepat yang harus ia lakukan adalah...`;
        opts = [`Mengumumkan temuan tersebut atau menyerahkan ke pihak berwenang`, `Langsung menyumbangkannya ke masjid tanpa pikir panjang`, `Menggunakan uang itu untuk membeli makanan karena ia lapar`, `Membiarkan saja karena bukan miliknya`];
        explanation = `Barang temuan (Luqathah) memiliki aturan khusus dalam Islam, yaitu harus diumumkan terlebih dahulu sebelum bisa dimanfaatkan atau disumbangkan.`;
      }
    }

    const correctAns = opts[0];
    
    // Acak posisi pilihan jawaban secara murni
    const shuffled = [...opts].map(value => ({ value, sort: Math.random() }))
                            .sort((a, b) => a.sort - b.sort)
                            .map(({ value }) => value);
                            
    questions.push({ 
      questionText: qText, 
      options: shuffled, 
      correctIndex: shuffled.indexOf(correctAns), 
      difficultyLevel: isFaseC ? 5 : isFaseB ? 3 : 1, 
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

        // Hapus soal lama (overwrite)
        await prisma.question.deleteMany({ where: { moduleId: mod.id } });
        
        const qs = makeSeedQuestions(sub.slug, grade, m);
        await prisma.question.createMany({ data: qs.map((q) => ({ moduleId: mod!.id, ...q })) });
        totalQuestions += qs.length;
      }
    }
  }

  revalidatePath("/admin/curriculum");
  return { ok: true, totalSubjects, totalModules, totalQuestions };
}
