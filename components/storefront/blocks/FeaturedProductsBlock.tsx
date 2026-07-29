import { prisma } from "@/lib/prisma";
import type { FeaturedProductsData } from "@/lib/blocks-types";
import { ProductCard } from "@/components/storefront/ProductCard";

const layoutCols: Record<FeaturedProductsData["layout"], string> = {
  "grid-2": "sm:grid-cols-2",
  "grid-3": "sm:grid-cols-2 lg:grid-cols-3",
  "grid-4": "sm:grid-cols-2 lg:grid-cols-4",
};

export async function FeaturedProductsBlock({
  data,
  storeSlug,
}: {
  data: FeaturedProductsData;
  storeSlug: string;
}) {
  const products = data.product_ids?.length
    ? await prisma.product.findMany({
        where: { id: { in: data.product_ids }, status: "published" },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
      })
    : await prisma.product.findMany({
        where: { store: { slug: storeSlug }, status: "published" },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 8,
      });

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      {data.title && <h2 className="mb-6 text-2xl font-semibold">{data.title}</h2>}
      <div className={`grid grid-cols-1 gap-6 ${layoutCols[data.layout] ?? layoutCols["grid-3"]}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
        ))}
      </div>
    </section>
  );
}
