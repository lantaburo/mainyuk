import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { AffiliateCodesClient } from "@/components/admin/AffiliateCodesClient";
import { Users } from "lucide-react";

export default async function PengaturanAfiliasiPage() {
  await requireSuperAdmin();

  const rawCodes = await prisma.affiliateCode.findMany({ 
    orderBy: { createdAt: "desc" },
    include: { withdrawals: true }
  });
  
  const rawWithdrawals = await prisma.affiliateWithdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: { affiliate: true }
  });

  const codes = rawCodes.map(c => ({
    ...c,
    commissionPct: c.commissionPct.toString(),
    totalEarnings: c.totalEarnings.toString(),
    pendingBalance: c.pendingBalance.toString(),
    paidOut: c.paidOut.toString(),
  })) as any;

  const withdrawals = rawWithdrawals.map(w => ({
    ...w,
    amount: w.amount.toString(),
  })) as any;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Program Afiliasi</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola kode afiliasi dan pantau performa setiap afiliator.</p>
        </div>
      </div>

      <AffiliateCodesClient initialCodes={codes} initialWithdrawals={withdrawals} />
    </div>
  );
}
