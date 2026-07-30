import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AiWebsiteGeneratorWizard } from "@/components/dashboard/AiWebsiteGeneratorWizard";

export default async function AiGeneratorPage() {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUniqueOrThrow({ where: { id: session.user.storeId } });
  const homePage = await prisma.storePage.findFirst({
    where: { storeId: store.id, pageType: "home" },
  });

  if (!homePage) {
    throw new Error("Halaman Beranda tidak ditemukan untuk toko ini.");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">AI Website Generator</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Deskripsikan bisnismu, AI akan menyusun desain halaman Beranda lengkap — kamu bisa lihat
        pratinjaunya sebelum diterapkan.
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
