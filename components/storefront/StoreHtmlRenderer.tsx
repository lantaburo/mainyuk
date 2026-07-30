import { Fragment } from "react";
import { sanitizeStoreHtml } from "@/lib/html-sanitize";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/ProductCard";

const WIDGET_RE = /<div[^>]*data-klikweb-widget="featured-products"[^>]*>[\s\S]*?<\/div>/g;

/**
 * Renders an AI-generated StorePage.html fragment for a public storefront
 * visitor. Sanitizes again (defense-in-depth on top of the sanitize already
 * done when the page was saved), then substitutes any
 * `data-klikweb-widget="featured-products"` marker with a live product grid
 * (real React children, not a string — Next.js's RSC bundler forbids
 * react-dom/server, so the marker's surrounding HTML is split into chunks
 * and the product grid is rendered as an actual sibling component instead
 * of being spliced into an HTML string).
 */
export async function StoreHtmlRenderer({
  html,
  storeId,
  storeSlug,
}: {
  html: string;
  storeId: string;
  storeSlug: string;
}) {
  if (!html.trim()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-24 text-center text-muted-foreground">
        <p>Halaman ini belum dibuat.</p>
      </div>
    );
  }

  const safe = sanitizeStoreHtml(html);
  const chunks = safe.split(WIDGET_RE);

  if (chunks.length === 1) {
    return <div className="sf-html-page" dangerouslySetInnerHTML={{ __html: safe }} />;
  }

  const products = await prisma.product.findMany({
    where: { storeId, status: "published" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="sf-html-page">
      {chunks.map((chunk, i) => (
        <Fragment key={i}>
          {chunk.trim() && <div dangerouslySetInnerHTML={{ __html: chunk }} />}
          {i < chunks.length - 1 && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} storeSlug={storeSlug} product={product} />
              ))}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
