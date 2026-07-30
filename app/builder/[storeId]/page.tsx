import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ensureRequiredPages } from "@/lib/ensure-required-pages";
import { parseBlocks } from "@/lib/blocks-types";
import { VisualBuilder } from "@/components/admin/VisualBuilder";
import type { Block } from "@/lib/blocks-types";
import { updateAdminPageBlocks } from "@/app/admin/actions";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";

export default async function BuilderPage({
  params,
}: {
  params: { storeId: string };
}) {
  await requireAdmin();

  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
  });
  if (!store) notFound();

  await ensureRequiredPages(store.id, store.siteType, store.name);

  const [pages, products] = await Promise.all([
    prisma.storePage.findMany({ where: { storeId: store.id } }),
    prisma.product.findMany({
      where: { storeId: store.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const homePage = pages.find((p) => p.pageType === "home");
  if (!homePage) notFound();

  const config = SITE_TYPE_CONFIG[store.siteType];

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 text-white flex flex-col">
      <VisualBuilder
        pageId={homePage.id}
        storeId={store.id}
        storeSlug={store.slug}
        storeName={store.name}
        siteType={store.siteType}
        initialBlocks={parseBlocks(homePage.blocks)}
        allowedBlocks={config.allowedBlocks}
        products={products}
        whatsappNumber={null} // Can fetch from settings if needed
      />
    </div>
  );
}
