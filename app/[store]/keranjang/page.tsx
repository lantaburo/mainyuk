"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";

export default function KeranjangPage() {
  const { store } = useParams<{ store: string }>();
  const router = useRouter();
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Keranjang belanja kosong.</p>
        <Link
          href={`/${store}/produk`}
          className={buttonVariants({ className: "mt-6 bg-[var(--store-primary)] text-white hover:opacity-90" })}
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Keranjang Belanja</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}:${item.variantId ?? ""}`}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              {item.variantName && (
                <p className="text-xs text-muted-foreground">{item.variantName}</p>
              )}
              <p className="mt-1 text-sm font-semibold">{formatRupiah(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
              >
                −
              </Button>
              <span className="w-6 text-center text-sm">{item.qty}</span>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
              >
                +
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => removeItem(item.productId, item.variantId)}
            >
              Hapus
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="text-lg font-semibold">{formatRupiah(subtotal)}</span>
      </div>

      <Button className="mt-6 w-full" onClick={() => router.push(`/${store}/checkout`)}>
        Lanjut ke Checkout
      </Button>
    </div>
  );
}
