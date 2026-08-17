"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAffiliateCode, toggleAffiliateCode, deleteAffiliateCode } from "@/app/admin/pengaturan/actions";
import { updateAffiliateStatus, deleteAffiliate, updateWithdrawalStatus } from "@/app/admin/pengaturan-afiliasi/actions";
import { Plus, Trash2, ToggleLeft, ToggleRight, Users, Loader2, CheckCircle2, XCircle, TrendingUp, Wallet, Check, X } from "lucide-react";

type AffiliateCode = {
  id: string;
  code: string;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  commissionPct: string | number;
  totalConversions: number;
  totalEarnings: string | number;
  pendingBalance: string | number;
  paidOut: string | number;
  status: "pending_review" | "active" | "suspended";
  isActive: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  createdAt: Date;
};

type Withdrawal = {
  id: string;
  affiliateId: string;
  amount: string | number;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  createdAt: Date;
  affiliate: AffiliateCode;
};

type Props = { initialCodes: AffiliateCode[], initialWithdrawals: Withdrawal[] };

export function AffiliateCodesClient({ initialCodes, initialWithdrawals }: Props) {
  const [codes, setCodes] = useState(initialCodes);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [tab, setTab] = useState<"affiliates" | "withdrawals">("affiliates");
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (id: string, status: "active" | "suspended" | "pending_review") => {
    if (!confirm(`Ubah status afiliator menjadi ${status}?`)) return;
    startTransition(async () => {
      await updateAffiliateStatus(id, status);
      setCodes(prev => prev.map(c => c.id === id ? { ...c, status, isActive: status === "active" } : c));
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus afiliator ini permanen?")) return;
    startTransition(async () => {
      await deleteAffiliate(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    });
  };

  const handleWithdrawalAction = (id: string, affiliateId: string, status: "approved" | "rejected", amount: number) => {
    if (!confirm(`Apakah Anda yakin ingin me-${status === "approved" ? "nyetujui" : "nolak"} penarikan ini?`)) return;
    startTransition(async () => {
      await updateWithdrawalStatus(id, affiliateId, status, amount);
      window.location.reload();
    });
  };

  const totalConversions = codes.reduce((s, c) => s + c.totalConversions, 0);
  const totalEarnings = codes.reduce((s, c) => s + Number(c.totalEarnings), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Afiliator", value: codes.length, color: "purple" },
          { label: "Total Konversi", value: totalConversions, color: "blue" },
          { label: "Total Komisi", value: `Rp ${totalEarnings.toLocaleString("id-ID")}`, color: "emerald" },
          { label: "Pending Withdrawal", value: pendingWithdrawals, color: "orange" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1 text-${s.color}-600`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button 
          onClick={() => setTab("affiliates")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "affiliates" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Data Afiliator
        </button>
        <button 
          onClick={() => setTab("withdrawals")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === "withdrawals" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Penarikan Dana
          {pendingWithdrawals > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingWithdrawals}</span>
          )}
        </button>
      </div>

      {tab === "affiliates" && (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 border-b border-slate-200/60">
              <tr>
                {["Kode", "Informasi", "Bank", "Saldo Pending", "Konversi", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Belum ada data afiliator</td>
                </tr>
              ) : codes.map(c => (
                <tr key={c.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-purple-600">{c.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{c.ownerName}</p>
                    <p className="text-xs text-slate-500">{c.ownerEmail || "-"}</p>
                    <p className="text-xs text-slate-500">{c.ownerPhone || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-semibold text-slate-700">{c.bankName || "-"}</p>
                    <p className="text-slate-500">{c.bankAccountNumber || "-"}</p>
                    <p className="text-slate-500">{c.bankAccountName || "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-orange-600">Rp {Number(c.pendingBalance).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-emerald-600">Terbayar: Rp {Number(c.paidOut).toLocaleString("id-ID")}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{c.totalConversions}x</td>
                  <td className="px-4 py-3">
                    {c.status === "pending_review" ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Pending</span>
                    ) : c.status === "active" ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Aktif</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Suspended</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {c.status === "pending_review" && (
                        <Button size="sm" onClick={() => handleStatusUpdate(c.id, "active")} className="bg-emerald-500 hover:bg-emerald-600 h-7 text-xs">Approve</Button>
                      )}
                      {c.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(c.id, "suspended")} className="text-red-500 h-7 text-xs">Suspend</Button>
                      )}
                      {c.status === "suspended" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(c.id, "active")} className="text-emerald-500 h-7 text-xs">Unsuspend</Button>
                      )}
                      <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-500 transition-colors ml-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 border-b border-slate-200/60">
              <tr>
                {["Tanggal", "Afiliator", "Rekening Tujuan", "Nominal", "Status", "Aksi"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Belum ada data penarikan</td>
                </tr>
              ) : withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(w.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{w.affiliate.ownerName}</p>
                    <p className="text-xs text-purple-600 font-mono">{w.affiliate.code}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-bold text-slate-700">{w.affiliate.bankName}</p>
                    <p className="text-slate-600">{w.affiliate.bankAccountNumber}</p>
                    <p className="text-slate-500">{w.affiliate.bankAccountName}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-orange-600">
                    Rp {Number(w.amount).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    {w.status === "pending" ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Pending</span>
                    ) : w.status === "approved" ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Approved</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Rejected</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {w.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleWithdrawalAction(w.id, w.affiliateId, "approved", Number(w.amount))}
                          className="bg-emerald-500 hover:bg-emerald-600 h-7 text-xs"
                          disabled={isPending}
                        >
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWithdrawalAction(w.id, w.affiliateId, "rejected", Number(w.amount))}
                          className="text-red-500 border-red-200 hover:bg-red-50 h-7 text-xs"
                          disabled={isPending}
                        >
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
