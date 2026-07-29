import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import { ensureRequiredPages } from "@/lib/ensure-required-pages";
import { parseBlocks } from "@/lib/blocks-types";
import { updatePageBlocks } from "@/app/dashboard/halaman/actions";
import { PageBlocksEditor } from "@/components/dashboard/PageBlocksEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function HalamanPage() {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUniqueOrThrow({ where: { id: session.user.storeId } });
  const config = SITE_TYPE_CONFIG[store.siteType];

  await ensureRequiredPages(store.id, store.siteType, store.name);

  const [pages, products] = await Promise.all([
    prisma.storePage.findMany({ where: { storeId: store.id } }),
    prisma.product.findMany({
      where: { storeId: store.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const pagesByType = new Map(pages.map((p) => [p.pageType, p]));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Halaman</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Susun dan edit blok konten untuk situs Anda.
      </p>

      <div className="mt-6">
        {config.pages.length === 1 ? (
          <PageEditorSection
            page={pagesByType.get(config.pages[0].pageType)!}
            pageConfig={config.pages[0]}
            allowedBlocks={config.allowedBlocks}
            products={products}
            siteType={store.siteType}
          />
        ) : (
          <Tabs defaultValue={config.pages[0].pageType}>
            <TabsList>
              {config.pages.map((p) => (
                <TabsTrigger key={p.pageType} value={p.pageType}>
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {config.pages.map((p) => (
              <TabsContent key={p.pageType} value={p.pageType} className="mt-4">
                <PageEditorSection
                  page={pagesByType.get(p.pageType)!}
                  pageConfig={p}
                  allowedBlocks={config.allowedBlocks}
                  products={products}
                  siteType={store.siteType}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

function PageEditorSection({
  page,
  pageConfig,
  allowedBlocks,
  products,
  siteType,
}: {
  page: { id: string; blocks: unknown; pageType: string };
  pageConfig: { pageType: string; label: string };
  allowedBlocks: (typeof SITE_TYPE_CONFIG)["storefront"]["allowedBlocks"];
  products: { id: string; name: string }[];
  siteType: SiteType;
}) {
  return (
    <PageBlocksEditor
      pageId={page.id}
      initialBlocks={parseBlocks(page.blocks)}
      allowedBlocks={allowedBlocks}
      products={products}
      siteType={siteType}
      pageType={pageConfig.pageType}
      pageLabel={pageConfig.label}
      action={updatePageBlocks}
    />
  );
}
