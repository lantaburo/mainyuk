import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import { VariantSelector } from "@/components/storefront/VariantSelector";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { store: string; productSlug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.store);
  if (!store || store.siteType !== "storefront") return {};

  const product = await prisma.product.findFirst({
    where: { storeId: store.id, slug: params.productSlug, status: "published" },
    include: { images: true },
  });
  if (!product) return {};

  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || `Beli ${product.name} di ${store.name}`;
  const image = product.seoImage || product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { store: string; productSlug: string };
}) {
  const store = await getStoreBySlug(params.store);
  if (!store || store.siteType !== "storefront") notFound();

  const product = await prisma.product.findFirst({
    where: { storeId: store.id, slug: params.productSlug, status: "published" },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
    },
  });
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.seoTitle || product.name,
    image: product.images.map(img => img.url),
    description: product.seoDescription || product.description || product.name,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `https://${store.slug}.mainyuk.my.id/produk/${product.slug}`,
      priceCurrency: "IDR",
      price: Number(product.price),
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: store.name,
      }
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Tanpa gambar
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2">
            {product.images.slice(1).map((img) => (
              <div key={img.id} className="h-16 w-16 overflow-hidden rounded border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        {product.category && (
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
        )}
        <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
        <VariantSelector
          productId={product.id}
          productName={product.name}
          imageUrl={product.images[0]?.url ?? null}
          basePrice={product.price.toString()}
          variants={product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            priceOverride: v.priceOverride ? v.priceOverride.toString() : null,
            stock: v.stock,
          }))}
        />
        {product.description && (
          <p className="mt-6 whitespace-pre-line text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
}
