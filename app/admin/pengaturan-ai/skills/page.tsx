import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { SkillsListClient } from "@/components/admin/SkillsClient";

export default async function PengaturanAiSkillsPage() {
  await requireSuperAdmin();

  const skills = await prisma.aiSkill.findMany({
    include: {
      versions: true
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instruksi AI (Skill Set)</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Atur instruksi (Prompt) yang akan disisipkan ke sistem AI saat membuat soal. 
          Anda dapat menambahkan instruksi spesifik, mematikan/menyalakan instruksi, 
          dan melihat riwayat versi untuk melakukan rollback jika diperlukan.
        </p>
      </div>

      <SkillsListClient skills={skills} />
    </div>
  );
}
