"use client";

import { useState } from "react";
import { Star, Gift, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type MarketplaceItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
};

export function MarketplaceClient({ 
  items, 
  studentId,
  starsBalance
}: { 
  items: MarketplaceItem[], 
  studentId: string,
  starsBalance: number
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClaim = async (itemId: string, price: number) => {
    if (starsBalance < price) {
      alert("Bintang kamu belum cukup untuk menukar hadiah ini.");
      return;
    }

    if (!confirm("Apakah kamu yakin ingin menukar bintangmu dengan hadiah ini?")) {
      return;
    }

    setLoadingId(itemId);
    try {
      const res = await fetch("/api/edu/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, itemId })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Hore! Hadiah berhasil ditukar. Tunggu orang tuamu memberikannya ya!");
        router.refresh();
      } else {
        alert(data.error || "Gagal menukar hadiah.");
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      {items.map((item) => {
        const canAfford = starsBalance >= item.price;
        return (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col group hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Gift className="w-20 h-20 text-amber-500" />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[40px]">
                {item.description || "Hadiah spesial untuk anak rajin!"}
              </p>
            </div>
            
            <div className="mt-6 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-amber-600">{item.price}</span>
              </div>
              
              <Button
                onClick={() => handleClaim(item.id, item.price)}
                disabled={!canAfford || loadingId === item.id}
                className={`rounded-xl px-4 ${canAfford ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {loadingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : canAfford ? (
                  "Tukar"
                ) : (
                  "Kurang Bintang"
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </>
  );
}
