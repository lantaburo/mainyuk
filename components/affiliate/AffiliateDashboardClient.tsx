"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Wallet, History, Users, RefreshCcw, LogOut } from "lucide-react";
import { requestWithdrawal, updateAffiliateBank } from "@/app/affiliate/actions";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

export default function AffiliateDashboardClient({ affiliate }: { affiliate: any }) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: affiliate.bankName || "",
    bankAccountNumber: affiliate.bankAccountNumber || "",
    bankAccountName: affiliate.bankAccountName || "",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://mainyuk.my.id/?ref=${affiliate.code}`);
    toast.success("Link referral berhasil disalin!");
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    setIsWithdrawing(true);
    const amount = Number(withdrawAmount);
    try {
      const res = await requestWithdrawal(amount);
      if (res.ok) {
        toast.success("Penarikan berhasil diajukan! Menunggu proses admin.");
        setWithdrawAmount("");
      } else {
        toast.error(res.error || "Gagal mengajukan penarikan.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleBankUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBank(true);
    try {
      const res = await updateAffiliateBank(bankForm);
      if (res.ok) {
        toast.success("Data rekening berhasil diperbarui.");
      } else {
        toast.error(res.error || "Gagal memperbarui rekening.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsUpdatingBank(false);
    }
  };

  if (affiliate.status === "pending_review") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Menunggu Review</h2>
          <p className="text-gray-500 mb-6">
            Akun afiliasi Anda sedang direview oleh admin. Silakan cek kembali nanti.
          </p>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="w-full">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </div>
    );
  }

  if (affiliate.status === "suspended") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akun Dibekukan</h2>
          <p className="text-gray-500 mb-6">
            Akun afiliasi Anda telah dibekukan. Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="w-full">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Afiliasi</h1>
            <p className="text-gray-500">Halo, {affiliate.ownerName}!</p>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-indigo-100 font-medium text-sm mb-1">Saldo Tersedia</p>
                <h3 className="text-3xl font-bold">Rp {Number(affiliate.pendingBalance).toLocaleString("id-ID")}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-indigo-200 text-sm">Total Komisi: Rp {Number(affiliate.totalEarnings).toLocaleString("id-ID")}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Konversi</p>
                <h3 className="text-2xl font-bold text-gray-900">{affiliate.totalConversions} <span className="text-sm font-normal text-gray-500">orang</span></h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium mb-2">Link Referral Anda</p>
            <div className="flex gap-2">
              <Input readOnly value={`https://mainyuk.my.id/?ref=${affiliate.code}`} className="bg-gray-50 text-gray-700" />
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Komisi {affiliate.commissionPct}% per konversi</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" /> Ajukan Penarikan
              </h2>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <Label>Nominal Penarikan (Rp)</Label>
                  <Input 
                    type="number" 
                    min="50000" 
                    max={Number(affiliate.pendingBalance)} 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Minimal 50000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimal penarikan Rp 50.000</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isWithdrawing || Number(affiliate.pendingBalance) < 50000} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isWithdrawing ? "Mengajukan..." : "Tarik Saldo"}
                </Button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Rekening</h2>
              <form onSubmit={handleBankUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nama Bank</Label>
                  <Input 
                    value={bankForm.bankName} 
                    onChange={e => setBankForm(prev => ({...prev, bankName: e.target.value}))} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nomor Rekening</Label>
                  <Input 
                    value={bankForm.bankAccountNumber} 
                    onChange={e => setBankForm(prev => ({...prev, bankAccountNumber: e.target.value}))} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama Pemilik</Label>
                  <Input 
                    value={bankForm.bankAccountName} 
                    onChange={e => setBankForm(prev => ({...prev, bankAccountName: e.target.value}))} 
                    required 
                  />
                </div>
                <Button type="submit" disabled={isUpdatingBank} variant="outline" className="w-full">
                  {isUpdatingBank ? "Menyimpan..." : "Simpan Rekening"}
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Riwayat Penarikan
            </h2>
            <div className="space-y-4">
              {affiliate.withdrawals.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Belum ada riwayat penarikan
                </div>
              ) : (
                affiliate.withdrawals.map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900">Rp {Number(w.amount).toLocaleString("id-ID")}</p>
                      <p className="text-xs text-gray-500">{new Date(w.createdAt).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {w.notes && <p className="text-xs text-gray-500 mt-1 italic">Catatan: {w.notes}</p>}
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        w.status === "approved" ? "bg-green-100 text-green-700" :
                        w.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {w.status === "approved" ? "Selesai" : w.status === "rejected" ? "Ditolak" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
