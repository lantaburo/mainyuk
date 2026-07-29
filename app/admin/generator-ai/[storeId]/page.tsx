import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { AiContentGenerator } from "@/components/admin/AiContentGenerator";
import { DEFAULT_INDUSTRY, isIndustry } from "@/lib/industry-content";

export default async function AdminGeneratorAiPage({
  params,
}: {
  params: { storeId: string };
}) {
  await requireSuperAdmin();

  const [store, aiSettings] = await Promise.all([
    prisma.store.findUnique({
      where: { id: params.storeId },
      include: { settings: true },
    }),
    prisma.aiSettings.findFirst({ select: { id: true } }),
  ]);
  if (!store) notFound();

  return (
    <div className="max-w-2xl">
      <a href="/admin" className="text-sm text-muted-foreground hover:underline">
        ← Kembali ke Daftar Tenant
      </a>
      <h1 className="mt-2 text-2xl font-semibold">Generator AI — {store.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buat konten atas nama toko ini lewat AI, cek hasilnya, lalu terapkan langsung ke halaman
        toko yang bersangkutan.
      </p>
      <AiContentGenerator
        storeId={store.id}
        storeSlug={store.slug}
        storeName={store.name}
        siteType={store.siteType}
        industry={store.industry && isIndustry(store.industry) ? store.industry : DEFAULT_INDUSTRY}
        whatsappNumber={store.settings?.whatsappNumber ?? null}
        aiConfigured={Boolean(aiSettings)}
      />
    </div>
  );
}
