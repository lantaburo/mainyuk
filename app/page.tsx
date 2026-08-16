import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Target, Trophy, ShieldCheck, Play, ArrowRight, Star, Heart, GraduationCap, Quote, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FEATURES = [
  {
    icon: Gamepad2,
    title: "Belajar Sambil Bermain",
    description: "Sistem gamifikasi interaktif yang membuat anak tidak cepat bosan dan selalu bersemangat.",
    color: "text-purple-600 bg-purple-100",
  },
  {
    icon: Target,
    title: "Sesuai Kurikulum SD",
    description: "Materi disusun terstruktur sesuai standar pendidikan untuk kelas 1 hingga 6 SD.",
    color: "text-blue-600 bg-blue-100",
  },
  {
    icon: Trophy,
    title: "Skor & Penghargaan",
    description: "Anak mendapatkan bintang dan piala virtual setiap kali menyelesaikan tantangan.",
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    icon: ShieldCheck,
    title: "Aman untuk Anak",
    description: "Lingkungan digital yang positif, bebas iklan, dan dirancang khusus untuk usia anak.",
    color: "text-emerald-600 bg-emerald-100",
  },
];

const GRADES = [
  { level: "Kelas 1", desc: "Membaca, Menulis, & Berhitung Dasar", color: "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200" },
  { level: "Kelas 2", desc: "Perkalian Dasar, Kosakata, & Alam sekitar", color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" },
  { level: "Kelas 3", desc: "Pecahan, Sejarah Nusantara, & Sains Dasar", color: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" },
  { level: "Kelas 4", desc: "Desimal, Geografi, & Tata Surya", color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" },
  { level: "Kelas 5", desc: "Matematika Lanjut, Biologi, & IPS", color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200" },
  { level: "Kelas 6", desc: "Persiapan Ujian, Logika, & Eksperimen", color: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200" },
];

const FAQS = [
  {
    q: "Apakah platform MainYuk ini gratis?",
    a: "Ya! Kami menyediakan banyak modul dasar secara gratis. Kami juga menawarkan akses premium untuk fitur pelaporan belajar mendetail bagi orang tua.",
  },
  {
    q: "Apakah orang tua bisa memantau perkembangan anak?",
    a: "Tentu! Terdapat dashboard khusus orang tua (Parental Dashboard) untuk melihat statistik skor, modul yang sudah dikerjakan, dan waktu belajar.",
  },
  {
    q: "Mata pelajaran apa saja yang tersedia?",
    a: "Saat ini fokus utama kami ada di Matematika, Ilmu Pengetahuan Alam (IPA), Ilmu Pengetahuan Sosial (IPS), dan Bahasa Indonesia, dengan soal hasil generator AI.",
  },
  {
    q: "Apakah MainYuk bisa diakses lewat Tablet atau Smartphone?",
    a: "Sangat bisa! MainYuk didesain responsif sehingga sangat nyaman dimainkan oleh anak-anak melalui tablet atau HP sekalipun.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 flex w-full items-center justify-between px-6 py-6 sm:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl rotate-3 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="text-white size-8" />
          </div>
          <span className="text-2xl font-black tracking-tight text-indigo-950">
            Main<span className="text-indigo-600">Yuk</span>
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
            Masuk / Guru
          </Link>
          <Link
            href="/quiz-demo"
            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-600/30"
          >
            <Play className="size-4 fill-white" />
            Coba Demo
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-8 sm:pt-20 pb-16 sm:pb-32 px-6 sm:px-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-8 animate-bounce">
          <Star className="size-4 fill-indigo-500" />
          <span>Platform Edukasi Gamifikasi No. 1</span>
        </div>
        
        <h1 className="text-4xl sm:text-7xl font-black text-slate-800 tracking-tight leading-[1.1] max-w-4xl mx-auto drop-shadow-sm">
          Belajar Jadi Lebih Seru <br className="hidden sm:block" />
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 py-1">
            Sambil Bermain!
          </span>
        </h1>
        
        <p className="mt-8 text-lg sm:text-xl font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Tingkatkan semangat belajar anak SD dengan ribuan kuis interaktif, modul kurikulum yang lengkap, dan sistem skor yang menyenangkan.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
          >
            Mulai Belajar Sekarang
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/quiz-demo"
            className="flex items-center justify-center gap-2 bg-white text-indigo-600 border-2 border-indigo-100 font-black text-lg px-8 py-4 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
          >
            Lihat Contoh Kuis
          </Link>
        </div>
        
        {/* Social Proof */}
        <div className="mt-16 flex items-center justify-center gap-4 text-sm font-semibold text-slate-500">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-br from-indigo-400 to-purple-500 z-${50-i*10}`}>
                {String.fromCharCode(64+i)}
              </div>
            ))}
          </div>
          <div className="text-left leading-tight">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-yellow-400" />)}
            </div>
            <span>Dipercaya oleh 10.000+ Siswa</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-20 py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800">Kenapa Memilih MainYuk?</h2>
            <p className="mt-4 text-slate-500 font-medium text-lg">Metode belajar yang disukai anak, didukung oleh teknologi AI.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all hover:-translate-y-2 group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="size-8" />
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade Modules */}
      <section className="relative z-20 py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">Pilih Tingkat Kelas</h2>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Materi kuis kami disesuaikan dengan tingkat perkembangan anak dari kelas 1 hingga kelas 6 SD.
              </p>
            </div>
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
              Lihat Seluruh Modul <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GRADES.map((grade, i) => (
              <div key={i} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md group ${grade.color}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black">{grade.level}</h3>
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center group-hover:bg-white transition-colors">
                    <ArrowRight className="size-5" />
                  </div>
                </div>
                <p className="font-semibold opacity-90">{grade.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold opacity-80">
                  <CheckCircle2 className="size-4" />
                  <span>100+ Modul Interaktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800">Tanya Jawab Seputar MainYuk</h2>
          </div>
          <Accordion className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-slate-50 border border-slate-200 rounded-2xl px-6">
                <AccordionTrigger className="text-left font-bold text-lg text-slate-800 hover:text-indigo-600 hover:no-underline py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 font-medium text-base pb-6 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <Heart className="size-16 fill-pink-500 text-pink-500 mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">Siap Memulai Petualangan Belajar?</h2>
            <p className="text-indigo-100 font-medium text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Bergabunglah sekarang secara gratis dan lihat anak Anda tersenyum saat belajar hal-hal baru setiap hari.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-white text-indigo-700 font-black text-xl px-10 py-5 rounded-2xl hover:scale-105 transition-transform shadow-xl"
            >
              Daftar Akun Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 px-6 sm:px-12 text-slate-400 font-medium">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-indigo-500 p-2 rounded-xl">
                <GraduationCap className="text-white size-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Main<span className="text-indigo-400">Yuk</span>
              </span>
            </div>
            <p className="max-w-sm mb-6 leading-relaxed">
              Platform belajar interaktif dengan gamifikasi yang membuat pendidikan dasar menjadi pengalaman yang seru dan dinantikan anak-anak.
            </p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Eksplor</h4>
            <ul className="space-y-3">
              <li><Link href="/quiz-demo" className="hover:text-white transition-colors">Demo Kuis</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Paket Belajar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Akun</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="hover:text-white transition-colors">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Daftar Baru</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard Guru</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} MainYuk Edukasi. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white">Syarat Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
