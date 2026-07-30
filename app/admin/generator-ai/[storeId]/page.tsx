import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { AiWebsiteGeneratorWizard } from "@/components/dashboard/AiWebsiteGeneratorWizard";

export default async function AdminAiGeneratorPage({
  params,
}: {
  params: { storeId: string };
}) {
  await requireAdmin();

  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
  });
  if (!store) notFound();

  const homePage = await prisma.storePage.findFirst({
    where: { storeId: store.id, pageType: "home" },
  });

  if (!homePage) {
    throw new Error("Halaman Beranda tidak ditemukan untuk toko ini.");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">AI Website Generator (Operator Mode)</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Membuat desain website untuk toko <span className="font-semibold">{store.name}</span>.
      </p>

      <div className="mt-6">
        <AiWebsiteGeneratorWizard
          storeId={store.id}
          pageId={homePage.id}
          storeSlug={store.slug}
          siteType={store.siteType}
          themeColor={store.themeColor}
          templateId={store.templateId}
          targetAudience={store.targetAudience}
          hasExistingHtml={Boolean(homePage.html?.trim())}
        />
      </div>
    </div>
  );
}
