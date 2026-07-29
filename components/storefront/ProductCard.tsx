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
      className="group flex flex-col overflow-hidden rounded-[var(--store-radius)] border bg-white shadow-[var(--store-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Tanpa gambar
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</h3>
        <p
          className="mt-auto text-base font-bold"
          style={{ color: "var(--store-primary)" }}
        >
          {formatRupiah(product.price)}
        </p>
      </div>
    </Link>
  );
}
