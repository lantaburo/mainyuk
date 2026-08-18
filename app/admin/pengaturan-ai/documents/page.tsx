import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { DocumentsClient } from "@/components/admin/DocumentsClient";

export default async function PengaturanAiDocumentsPage() {
  await requireSuperAdmin();

  const documents = await prisma.aiDocument.findMany({
    include: {
      subject: true
    },
    orderBy: { createdAt: "desc" }
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dokumen Referensi AI (RAG)</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Unggah dokumen referensi (PDF/TXT) agar AI dapat membacanya sebagai pedoman 
          saat menyusun soal. Anda bisa mengatur dokumen untuk dibaca secara Global (semua mapel) 
          atau khusus untuk Mata Pelajaran tertentu.
        </p>
      </div>

      <DocumentsClient documents={documents} subjects={subjects} />
    </div>
  );
}
