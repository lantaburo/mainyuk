"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/storefront/CartProvider";

interface Variant {
  id: string;
  name: string;
  priceOverride: string | null;
  stock: number;
}

export function VariantSelector({
  productId,
  productName,
  imageUrl,
  basePrice,
  variants,
}: {
  productId: string;
  productName: string;
  imageUrl: string | null;
  basePrice: string;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<string | null>(variants[0]?.id ?? null);
  const activeVariant = variants.find((v) => v.id === selected);
  const price = activeVariant?.priceOverride ?? basePrice;

  function handleAddToCart() {
    addItem({
      productId,
      variantId: activeVariant?.id ?? null,
      name: productName,
      variantName: activeVariant?.name ?? null,
      price: Number(price),
      imageUrl,
      qty: 1,
    });
    toast.success("Ditambahkan ke keranjang");
  }

  return (
    <div>
      {variants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelected(variant.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm",
                selected === variant.id && "border-[var(--store-primary)] bg-[var(--store-primary)]/10"
              )}
            >
              {variant.name}
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-2xl font-bold">{formatRupiah(price)}</p>
      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-4 inline-flex h-11 items-center rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 text-sm font-medium text-white shadow-[var(--store-shadow)]"
      >
        Tambah ke Keranjang
      </button>
    </div>
  );
}
