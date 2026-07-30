import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { AiWebsiteGeneratorWizard } from "@/components/dashboard/AiWebsiteGeneratorWizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/stores"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Website Generator (Operator Mode)</h1>
          <p className="text-sm text-muted-foreground">
            Membuat desain website untuk toko <span className="font-semibold">{store.name}</span>.
          </p>
        </div>
      </div>

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
          afterApplyUrl={`/admin-editor/${store.id}`}
        />
      </div>
    </div>
  );
}
