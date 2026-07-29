import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  storeSlug: string;
  categories: { id: string; name: string; slug: string }[];
  active?: string;
}

export function CategoryFilter({ storeSlug, categories, active }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/${storeSlug}/produk`}
        className={cn(
          "rounded-full border px-3 py-1 text-sm",
          !active && "border-[var(--store-primary)] bg-[var(--store-primary)] text-white"
        )}
      >
        Semua
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${storeSlug}/produk?kategori=${category.slug}`}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            active === category.slug &&
              "border-[var(--store-primary)] bg-[var(--store-primary)] text-white"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
