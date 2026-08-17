import Link from "next/link";
import { TrendingUp, Users, Wallet, Star, CheckCircle, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Program Afiliasi MainYuk — Hasilkan Komisi Bersama Kami",
  description: "Bergabunglah dengan Program Afiliasi MainYuk dan dapatkan komisi untuk setiap referral pelanggan baru.",
};

const BENEFITS = [
  { icon: TrendingUp, title: "Komisi Menarik", desc: "Dapatkan komisi 10% dari setiap transaksi referral Anda." },
  { icon: Wallet, title: "Pencairan Mudah", desc: "Ajukan withdrawal kapan saja, minimum Rp 50.000." },
  { icon: Users, title: "Tanpa Batas", desc: "Tidak ada batasan jumlah referral. Semakin banyak, semakin besar komisi Anda." },
  { icon: Star, title: "Dashboard Lengkap", desc: "Pantau performa, komisi, dan histori withdrawal Anda secara real-time." },
];

const STEPS = [
  { num: "1", title: "Daftar Akun", desc: "Buat akun MainYuk atau login jika sudah punya akun." },
  { num: "2", title: "Daftar Afiliasi", desc: "Isi formulir pendaftaran dan data rekening bank Anda." },
  { num: "3", title: "Dapatkan Kode", desc: "Setelah diverifikasi admin, Anda mendapat kode unik afiliasi." },
  { num: "4", title: "Bagikan & Hasilkan", desc: "Bagikan link dengan kode afiliasi Anda dan dapatkan komisi." },
];

export default function AffiliateLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-black text-2xl text-white tracking-tight">
            Main<span className="text-indigo-400">Yuk</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/affiliate/dashboard">
              <Button variant="ghost" className="text-white hover:text-indigo-300 hover:bg-white/10">
                Dashboard Saya
              </Button>
            </Link>
            <Link href="/affiliate/daftar">
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-2 text-sm font-semibold text-indigo-300 mb-6">
          <Gift className="w-4 h-4" />
          Program Afiliasi Resmi MainYuk
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Hasilkan Uang dengan{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Berbagi MainYuk
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Daftarkan diri sebagai Afiliator MainYuk dan dapatkan komisi 10% dari setiap referral pelanggan baru. Tanpa modal, tanpa risiko.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/affiliate/daftar">
            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-lg shadow-indigo-500/30">
              Mulai Sekarang — Gratis!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/affiliate/dashboard">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl">
              Lihat Dashboard Saya
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Kenapa Jadi Afiliator MainYuk?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <b.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent" />
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                {s.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 rounded-3xl p-12">
          <h2 className="text-4xl font-black mb-4">Siap Bergabung?</h2>
          <p className="text-slate-300 text-lg mb-8">Daftar sekarang dan mulai menghasilkan komisi hari ini!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/affiliate/daftar">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg px-10 py-6 rounded-2xl">
                Daftar Afiliasi — Gratis!
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            {["Gratis Mendaftar", "Tanpa Modal", "Komisi Langsung", "Support 24/7"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        <p>© 2025 MainYuk. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
