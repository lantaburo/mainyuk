import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { cookies } from "next/headers";
import { Star, Gift, Package, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketplaceClient } from "@/components/dashboard/MarketplaceClient";

export default async function MarketplacePage() {
  const session = await requireAuth();
  const cookieStore = cookies();
  const selectedStudentId = cookieStore.get("selectedStudentId")?.value;

  if (!selectedStudentId) {
    redirect("/select-profile");
  }

  const student = await prisma.studentProfile.findFirst({
    where: { id: selectedStudentId, parentId: session.user.id }
  });

  if (!student) {
    redirect("/select-profile");
  }

  // Fetch items: Global items OR items created by their parent
  const items = await prisma.marketplaceItem.findMany({
    where: {
      isActive: true,
      OR: [
        { isGlobal: true },
        { creatorId: session.user.id }
      ]
    },
    orderBy: { price: 'asc' }
  });

  // Fetch claims
  const claims = await prisma.rewardClaim.findMany({
    where: { studentId: student.id },
    include: { item: true },
    orderBy: { claimedAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
            <Gift className="w-4 h-4" />
            Toko Hadiah
          </div>
          <h1 className="text-3xl font-black mb-2">Tukar Bintangmu!</h1>
          <p className="text-amber-100 font-medium max-w-md">
            Kumpulkan bintang dengan menyelesaikan modul dan tukarkan dengan hadiah menarik yang disiapkan oleh orang tuamu.
          </p>
        </div>
        
        <div className="relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 flex flex-col items-center min-w-[200px]">
          <div className="text-amber-100 font-medium mb-1">Total Bintang</div>
          <div className="flex items-center gap-3">
            <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 drop-shadow-md" />
            <span className="text-5xl font-black drop-shadow-md">{student.starsBalance}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Marketplace Items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            Daftar Hadiah
          </h2>
          
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Belum ada hadiah</h3>
              <p className="text-slate-500 mt-2">Belum ada hadiah yang ditambahkan. Minta orang tuamu untuk menambahkan hadiah ya!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MarketplaceClient items={items} studentId={student.id} starsBalance={student.starsBalance} />
            </div>
          )}
        </div>

        {/* Claim History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Riwayat Penukaran
          </h2>
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            {claims.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Belum ada hadiah yang ditukar.
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim: any) => (
                  <div key={claim.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                      <Gift className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate">{claim.item.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {claim.item.price} Bintang
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-200">
                        {claim.status === "pending" ? (
                          <span className="text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Menunggu</span>
                        ) : claim.status === "fulfilled" ? (
                          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Diterima</span>
                        ) : (
                          <span className="text-rose-600">Dibatalkan</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
