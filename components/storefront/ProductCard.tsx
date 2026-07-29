import Link from "next/link";
import { formatRupiah } from "@/lib/format";

interface ProductCardProps {
  storeSlug: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string };
    images: { url: string }[];
  };
}

export function ProductCard({ storeSlug, product }: ProductCardProps) {
  const image = product.images[0]?.url;
  return (
    <Link
      href={`/${storeSlug}/produk/${product.slug}`}
      className="group overflow-hidden rounded-[var(--store-radius)] border shadow-[var(--store-shadow)] transition-shadow"
    >
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Tanpa gambar
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-[var(--store-primary)]">
          {formatRupiah(product.price)}
        </p>
      </div>
    </Link>
  );
}
