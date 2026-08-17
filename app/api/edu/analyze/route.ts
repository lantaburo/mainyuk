import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamAiProvider, AiClientError } from "@/lib/ai-client";
import { getAiConfigs } from "@/lib/ai-actions";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const studentId = body?.studentId;

  if (!studentId) {
    return new Response("Student ID diperlukan", { status: 400 });
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: studentId, parentId: session.user.id },
  });

  if (!student) {
    return new Response("Data siswa tidak ditemukan atau akses ditolak", { status: 403 });
  }

  const configs = await getAiConfigs();
  if (configs.length === 0) {
    return new Response("Sistem AI belum dikonfigurasi oleh admin.", { status: 400 });
  }

  // Fetch student progress
  const progress = await prisma.studentProgress.findMany({
    where: { studentId: student.id, isCompleted: true },
    include: { module: { include: { subject: true } } },
  });

  // Calculate stats
  const subjectStats: Record<string, { totalScore: number; count: number }> = {};
  for (const p of progress) {
    const subj = p.module.subject.name;
    if (!subjectStats[subj]) subjectStats[subj] = { totalScore: 0, count: 0 };
    subjectStats[subj].totalScore += p.score;
    subjectStats[subj].count += 1;
  }

  const subjectAverages = Object.entries(subjectStats).map(([name, data]) => ({
    name,
    avg: Math.round(data.totalScore / data.count),
    modulesCompleted: data.count,
  }));

  const overallAvg = subjectAverages.length > 0
    ? Math.round(subjectAverages.reduce((acc, curr) => acc + curr.avg, 0) / subjectAverages.length)
    : 0;

  let progressText = `Anak ini belum menyelesaikan modul apa pun.`;
  if (subjectAverages.length > 0) {
    progressText = `Nilai rata-rata keseluruhan: ${overallAvg}/100.
Rincian per mata pelajaran:
${subjectAverages.map(s => `- ${s.name}: ${s.avg}/100 (${s.modulesCompleted} modul)`).join("\n")}
`;
  }

  const prompt = `Anda adalah seorang psikolog pendidikan anak dan pakar pendampingan belajar.
Orang tua dari seorang anak bernama ${student.name} (Kelas ${student.gradeLevel} SD) ingin mengetahui analisis perkembangan belajar anaknya dan meminta saran konkret mengenai perlakuan (treatment) apa yang harus dilakukan di rumah untuk meningkatkan atau mempertahankan prestasinya.

Berikut adalah data nilai anak tersebut dari platform belajar interaktif:
${progressText}

Berikan balasan yang terstruktur dengan format Markdown yang rapi (gunakan bullet points, bold, dan emoji yang sesuai).
Gunakan gaya bahasa yang ramah, memotivasi, dan berempati terhadap orang tua.

Struktur balasan yang diharapkan:
1. **Pujian & Analisis Singkat**: Puji pencapaian anak sejauh ini dan analisis area mana yang ia kuasai serta mana yang mungkin perlu perhatian lebih.
2. **Saran Treatment Praktis di Rumah**: Berikan 3-4 aktivitas spesifik atau cara belajar di rumah yang bisa dilakukan orang tua untuk membantu anak (sesuaikan dengan umurnya di Kelas ${student.gradeLevel} SD dan nilai mata pelajarannya).
3. **Kata Penutup yang Memotivasi**.

Langsung saja masuk ke isi analisis tanpa intro berbasa-basi.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamAiProvider(configs, prompt)) {
          if (event.type === "delta") {
            controller.enqueue(encoder.encode(event.text));
          }
        }
      } catch (err) {
        const msg = err instanceof AiClientError ? err.message : "Terjadi kesalahan saat menghubungi AI.";
        controller.enqueue(encoder.encode(`\n\n**Error:** ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
