import Image from "next/image";
import Link from "next/link";
import { Monitor, Search, Smartphone, Gauge, Globe, Store, Megaphone, Layout, Building2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE_TYPES, SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";

const FEATURES = [
  {
    icon: Monitor,
    title: "Tampil Profesional",
    description: "Tingkatkan kepercayaan pelanggan.",
  },
  {
    icon: Search,
    title: "Mudah Ditemukan",
    description: "Optimasi SEO friendly, lebih mudah di Google.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Nyaman diakses di semua perangkat.",
  },
  {
    icon: Gauge,
    title: "Cepat & Praktis",
    description: "Kelola mudah, hemat waktu dan biaya.",
  },
];

const SITE_TYPE_ICONS: Record<SiteType, typeof Store> = {
  storefront: Store,
  sales_page: Megaphone,
  landing_page: Layout,
  company_profile: Building2,
};

// Placeholder — ganti dengan kutipan asli dari pengguna klikweb.id begitu terkumpul.
const TESTIMONIALS = [
  {
    name: "Nama Pemilik Toko",
    role: "Fashion & Aksesoris",
    quote: "Tulis testimoni pelanggan di sini setelah terkumpul.",
  },
  {
    name: "Nama Pemilik Toko",
    role: "Makanan & Minuman",
    quote: "Tulis testimoni pelanggan di sini setelah terkumpul.",
  },
  {
    name: "Nama Pemilik Toko",
    role: "Jasa & Konsultan",
    quote: "Tulis testimoni pelanggan di sini setelah terkumpul.",
  },
];

const FAQS = [
  {
    q: "Apakah saya perlu keahlian coding untuk membuat toko online?",
    a: "Tidak. Semua toko di klikweb.id dibuat lewat editor halaman tanpa perlu coding — tinggal pilih blok konten, isi teks dan gambar.",
  },
  {
    q: "Jenis situs apa saja yang tersedia?",
    a: "Ada 4 pilihan: Storefront (toko online lengkap), Sales Page (halaman jual 1 produk), Landing Page (promosi kampanye), dan Company Profile (profil perusahaan).",
  },
  {
    q: "Metode pembayaran apa yang didukung?",
    a: "Toko bisa menerima pembayaran lewat Midtrans (kartu/e-wallet/VA), QRIS, atau transfer bank manual — sesuai yang diaktifkan pemilik toko.",
  },
  {
    q: "Apakah toko saya bisa dapat notifikasi WhatsApp otomatis?",
    a: "Bisa, dengan menghubungkan API WhatsApp milik toko dari halaman Pengaturan — notifikasi pesanan baru & konfirmasi pembayaran terkirim otomatis.",
  },
  {
    q: "Bisa pakai domain sendiri?",
    a: "Toko langsung online di klikweb.id/nama-toko sejak awal. Dukungan subdomain dan domain sendiri akan hadir sebagai fitur upgrade.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#0B2B26]">
      <section className="relative flex h-[70vh] w-full flex-col overflow-hidden sm:h-[85vh] lg:h-screen">
        <div className="absolute inset-0">
          <Image
            src="/hero-turtle.png"
            alt="Dari lambat jadi cepat bersama klikweb.id"
            fill
            sizes="100vw"
            className="object-cover object-[72%_center] sm:object-[65%_center] lg:object-center"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col">
          <header className="flex w-full items-center justify-between bg-gradient-to-b from-white/35 to-transparent px-6 py-6 backdrop-blur-sm sm:px-12">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <Image
              src="/logo-mark.png"
              alt="klikweb.id"
              width={438}
              height={95}
              className="h-8 w-auto sm:h-9"
              priority
            />
            <nav className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-[#0B2B26] hover:text-[#F0640A]">
                Masuk
              </Link>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/register" />}
                className="bg-[#0B3B35] text-white hover:bg-[#0F4A42]"
              >
                Buat Toko
              </Button>
            </nav>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center sm:px-12">
            <div className="rounded-3xl border border-white/40 bg-white/25 px-6 py-8 shadow-xl backdrop-blur-md sm:px-12 sm:py-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0B2B26] drop-shadow-sm sm:text-5xl">
                Ubah bisnis yang lambat menjadi{" "}
                <span className="text-[#F0640A]">cepat &amp; unggul</span> bersama klikweb.id
              </h1>
              <p className="mt-5 text-base font-medium text-[#0B2B26]/90 sm:text-lg">
                Dari yang sulit ditemukan, jadi mudah ditemukan.
                <br />
                Dari yang sepi, jadi <span className="font-semibold text-[#0B2B26]">ramai pelanggan</span>.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/register" />}
                  className="bg-[#0B3B35] text-white hover:bg-[#0F4A42]"
                >
                  Mulai Gratis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        <div className="relative z-20 h-0">
          <div className="absolute inset-x-0 top-0 -translate-y-1/2 px-6 sm:px-12">
            <div className="mx-auto max-w-5xl grid grid-cols-2 gap-6 rounded-2xl border border-[#0B2B26]/10 bg-white p-6 shadow-xl sm:grid-cols-4 sm:p-8">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                  <feature.icon className="size-6 text-[#0B3B35]" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="mt-0.5 text-xs text-[#0B2B26]/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="jenis-situs" className="mx-auto max-w-5xl px-6 pt-40 pb-20 sm:px-12 sm:pt-24">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Pilih Jenis Situs yang Sesuai Bisnismu
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#0B2B26]/70">
            Kustomisasi tampilan, isi konten, langsung online di{" "}
            <span className="font-medium">klikweb.id/nama-toko</span>.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {SITE_TYPES.map((type) => {
              const config = SITE_TYPE_CONFIG[type];
              const Icon = SITE_TYPE_ICONS[type];
              return (
                <div
                  key={type}
                  id={`jenis-situs-${type}`}
                  className="scroll-mt-24 rounded-xl border border-[#0B2B26]/10 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#0B3B35]/10">
                    <Icon className="size-5 text-[#0B3B35]" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-3 font-semibold">{config.label}</h3>
                  <p className="mt-1 text-sm text-[#0B2B26]/70">{config.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6 sm:px-12">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="rounded-full bg-[#0B2B26]/5 px-3 py-1 text-xs font-medium text-[#0B2B26]/60">
                Contoh — testimoni asli menyusul
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Apa Kata Pengguna klikweb.id</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="rounded-xl border border-[#0B2B26]/10 bg-[#F6F3EE] p-5">
                  <Quote className="size-5 text-[#F0640A]" strokeWidth={1.75} />
                  <p className="mt-3 text-sm italic text-[#0B2B26]/80">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[#0B2B26]/60">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-6 py-20 sm:px-12">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <Accordion className="mt-8">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-[#0B2B26]/70">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="bg-[#0B3B35] py-16 text-white">
          <div className="mx-auto max-w-2xl px-6 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Bisnismu Sudah Siap Naik Level?
            </h2>
            <p className="mt-3 text-white/70">
              Buat toko online profesional hari ini — mulai gratis, tanpa perlu keahlian teknis.
            </p>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/register" />}
              className="mt-6 bg-[#F0640A] text-white hover:bg-[#F0640A]/90"
            >
              Mulai Gratis Sekarang
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B3B35] px-6 py-14 text-white sm:px-12">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-4">
          <div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/25 px-5 py-2.5">
              <Globe className="size-5" strokeWidth={1.75} />
              <span className="text-lg font-bold">
                klik<span className="font-bold">web</span>.id
              </span>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Website & toko online profesional siap pakai untuk UMKM Indonesia.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Jenis Situs</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {SITE_TYPES.map((type) => (
                <li key={type}>
                  <a href={`#jenis-situs-${type}`} className="hover:text-white">
                    {SITE_TYPE_CONFIG[type].label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Bantuan</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Akun</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/login" className="hover:text-white">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white">
                  Buat Toko
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl border-t border-white/15 pt-6 text-center text-sm text-white/50">
          <p>© {new Date().getFullYear()} klikweb.id — Website Profesional untuk UMKM</p>
          <p className="mt-1">Melayani dengan ❤️ untuk UMKM Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
