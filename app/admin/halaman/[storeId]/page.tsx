import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import { ensureRequiredPages } from "@/lib/ensure-required-pages";
import { parseBlocks } from "@/lib/blocks-types";
import { updatePageBlocksByAdmin } from "@/app/admin/halaman/[storeId]/actions";
import { PageBlocksEditor } from "@/components/dashboard/PageBlocksEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { notFound } from "next/navigation";

export default async function AdminHalamanPage({ params }: { params: { storeId: string } }) {
  await requireAdmin();
  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
    include: { settings: true },
  });
  if (!store) notFound();

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
      <a href="/admin" className="text-sm text-muted-foreground hover:underline">
        ← Kembali ke Daftar Tenant
      </a>
      <h1 className="mt-2 text-2xl font-semibold">Edit Halaman — {store.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Susun dan edit blok konten untuk situs ini sebagai admin/operator.
      </p>

      <div className="mt-6">
        {config.pages.length === 1 ? (
          <PageEditorSection
            page={pagesByType.get(config.pages[0].pageType)!}
            pageConfig={config.pages[0]}
            allowedBlocks={config.allowedBlocks}
            products={products}
            siteType={store.siteType}
            storeId={store.id}
            storeSlug={store.slug}
            themeColor={store.themeColor}
            templateId={store.templateId}
            whatsappNumber={store.settings?.whatsappNumber ?? null}
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
                  storeId={store.id}
                  storeSlug={store.slug}
                  themeColor={store.themeColor}
                  templateId={store.templateId}
                  whatsappNumber={store.settings?.whatsappNumber ?? null}
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
  storeId,
  storeSlug,
  themeColor,
  templateId,
  whatsappNumber,
}: {
  page: { id: string; blocks: unknown; pageType: string };
  pageConfig: { pageType: string; label: string };
  allowedBlocks: (typeof SITE_TYPE_CONFIG)["storefront"]["allowedBlocks"];
  products: { id: string; name: string }[];
  siteType: SiteType;
  storeId: string;
  storeSlug: string;
  themeColor: string;
  templateId: string | null;
  whatsappNumber: string | null;
}) {
  return (
    <PageBlocksEditor
      pageId={page.id}
      storeId={storeId}
      storeSlug={storeSlug}
      themeColor={themeColor}
      templateId={templateId}
      whatsappNumber={whatsappNumber}
      initialBlocks={parseBlocks(page.blocks)}
      allowedBlocks={allowedBlocks}
      products={products}
      siteType={siteType}
      pageType={pageConfig.pageType}
      pageLabel={pageConfig.label}
      action={updatePageBlocksByAdmin}
    />
  );
}
