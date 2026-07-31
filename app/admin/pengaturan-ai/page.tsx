import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { AiProviderManager } from "@/components/admin/AiProviderManager";

export default async function PengaturanAiPage() {
  await requireSuperAdmin();

  const providers = await prisma.aiProvider.findMany({
    orderBy: { priority: "asc" }
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan AI (Multi-Provider)</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Atur daftar penyedia (provider) AI untuk fitur &ldquo;Generate dengan AI&rdquo;. 
          Jika provider pada urutan pertama (paling atas) mengalami kegagalan, sistem akan 
          otomatis mencoba (fallback) ke provider urutan kedua, dan seterusnya.
        </p>
      </div>

      <AiProviderManager providers={providers} />
    </div>
  );
}
