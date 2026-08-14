import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { DiscountCodesClient } from "@/components/admin/DiscountCodesClient";
import { Tag } from "lucide-react";

export default async function PengaturanDiskonPage() {
  await requireSuperAdmin();

  const rawCodes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  // Serialize Decimal to string so it's compatible with Client Component props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codes = rawCodes.map(c => ({
    ...c,
    discountPct: c.discountPct?.toString() ?? null,
    discountAmt: c.discountAmt?.toString() ?? null,
    minOrder: c.minOrder?.toString() ?? null,
  })) as any;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Kode Diskon</h1>
          <p className="mt-1 text-sm text-gray-500">Buat dan kelola kode diskon untuk siswa dan orang tua.</p>
        </div>
      </div>

      <DiscountCodesClient initialCodes={codes} />
    </div>
  );
}
