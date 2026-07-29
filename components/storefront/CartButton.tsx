"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/storefront/CartProvider";

export function CartButton({ storeSlug }: { storeSlug: string }) {
  const { count } = useCart();

  return (
    <Link href={`/${storeSlug}/keranjang`} className="relative flex items-center gap-1 text-sm">
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[var(--store-primary)] text-[10px] text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
