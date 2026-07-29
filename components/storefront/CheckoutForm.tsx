"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartProvider";
import { createOrder } from "@/app/[store]/checkout/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

type PaymentMethod = "midtrans" | "qris" | "bank_transfer";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  midtrans: "Kartu / E-Wallet / VA (Midtrans)",
  qris: "QRIS",
  bank_transfer: "Transfer Bank",
};

export function CheckoutForm({
  storeSlug,
  flatShippingCost,
  midtransAvailable,
  qrisAvailable,
  bankTransferAvailable,
}: {
  storeSlug: string;
  flatShippingCost: number;
  midtransAvailable: boolean;
  qrisAvailable: boolean;
  bankTransferAvailable: boolean;
}) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const availableMethods: PaymentMethod[] = [
    ...(midtransAvailable ? (["midtrans"] as const) : []),
    ...(qrisAvailable ? (["qris"] as const) : []),
    ...(bankTransferAvailable ? (["bank_transfer"] as const) : []),
  ];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    availableMethods[0] ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Keranjang belanja kosong. Kembali ke halaman produk untuk mulai belanja.
      </p>
    );
  }

  if (availableMethods.length === 0) {
    return (
      <p className="text-destructive">
        Toko ini belum mengaktifkan metode pembayaran apa pun. Hubungi pemilik toko.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createOrder(storeSlug, items, {
      name,
      phone,
      email,
      address,
      paymentMethod,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clear();

    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    router.push(`/${storeSlug}/pesanan/${result.orderNumber}`);
  }

  const total = subtotal + flatShippingCost;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="font-medium">Data Pembeli</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Nomor WhatsApp</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email (opsional)</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Alamat Pengiriman</Label>
          <Textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-medium">Metode Pembayaran</h2>
        {availableMethods.map((method) => (
          <label
            key={method}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm",
              paymentMethod === method && "border-[var(--store-primary)] bg-[var(--store-primary)]/5"
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
            />
            {PAYMENT_LABELS[method]}
          </label>
        ))}
      </div>

      <div className="space-y-1 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ongkos Kirim</span>
          <span>{formatRupiah(flatShippingCost)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 font-semibold">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Memproses..." : "Buat Pesanan"}
      </Button>
    </form>
  );
}
