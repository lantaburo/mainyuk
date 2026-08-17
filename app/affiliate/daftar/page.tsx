"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAffiliate } from "@/app/affiliate/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, UserCheck, Building2, CreditCard } from "lucide-react";
import Link from "next/link";

export default function AffiliateDaftarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await registerAffiliate(form);
      if (res.ok) {
        toast.success("Pendaftaran berhasil! Akun Anda sedang dalam proses review.");
        router.push("/affiliate/dashboard");
      } else {
        toast.error(res.error || "Gagal mendaftar, coba lagi.");
      }
    } catch {
      toast.error("Terjadi kesalahan, harap login terlebih dahulu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/affiliate" className="font-black text-3xl text-white tracking-tight">
            Main<span className="text-indigo-400">Yuk</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Daftar Program Afiliasi</h1>
          <p className="text-slate-400 mt-2">Isi data diri dan rekening bank Anda untuk mulai menghasilkan komisi.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? "bg-indigo-500 text-white" : "bg-white/10 text-white/40"}`}>
                {s}
              </div>
              {s < 2 && <div className={`w-16 h-0.5 ${step >= 2 ? "bg-indigo-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-5 backdrop-blur-xl">
            {step === 1 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <h2 className="font-bold text-white text-lg">Data Diri</h2>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Nama Lengkap</Label>
                  <Input
                    required
                    value={form.ownerName}
                    onChange={(e) => setField("ownerName", e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    required
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setField("ownerEmail", e.target.value)}
                    placeholder="email@contoh.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Nomor WhatsApp</Label>
                  <Input
                    required
                    type="tel"
                    value={form.ownerPhone}
                    onChange={(e) => setField("ownerPhone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold gap-2">
                  Lanjut ke Data Bank <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <h2 className="font-bold text-white text-lg">Data Rekening Bank</h2>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Nama Bank</Label>
                  <Input
                    required
                    value={form.bankName}
                    onChange={(e) => setField("bankName", e.target.value)}
                    placeholder="BCA, BNI, Mandiri, dll."
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Nomor Rekening</Label>
                  <Input
                    required
                    value={form.bankAccountNumber}
                    onChange={(e) => setField("bankAccountNumber", e.target.value)}
                    placeholder="1234567890"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Nama Pemilik Rekening</Label>
                  <Input
                    required
                    value={form.bankAccountName}
                    onChange={(e) => setField("bankAccountName", e.target.value)}
                    placeholder="Sesuai nama di buku rekening"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={() => setStep(1)}>
                    Kembali
                  </Button>
                  <Button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Daftar Sekarang!"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
            Daftar MainYuk dulu
          </Link>
        </p>
      </div>
    </div>
  );
}
