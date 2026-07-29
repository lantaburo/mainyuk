import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategoryFilter } from "@/components/storefront/CategoryFilter";

export default async function ProdukPage({
  params,
  searchParams,
}: {
  params: { store: string };
  searchParams: { kategori?: string };
}) {
  const store = await getStoreBySlug(params.store);
  if (!store || store.siteType !== "storefront") notFound();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { storeId: store.id }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        storeId: store.id,
        status: "published",
        ...(searchParams.kategori ? { category: { slug: searchParams.kategori } } : {}),
      },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Produk</h1>
      {categories.length > 0 && (
        <CategoryFilter
          storeSlug={store.slug}
          categories={categories}
          active={searchParams.kategori}
        />
      )}
      {products.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Belum ada produk.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={store.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
