import { SITE_TYPE_CONFIG, type SiteType, type BlockType } from "@/lib/site-types";
import { INDUSTRY_CONTENT, type Industry } from "@/lib/industry-content";

/**
 * Full schema docs — includes ALL design fields the AI must choose.
 */
const BLOCK_SCHEMA_DOCS: Record<BlockType, string> = {
  hero: `hero: {
    "title": string,                    // WAJIB — judul utama (maks 10 kata, kuat & menarik)
    "subtitle": string,                 // WAJIB — kalimat pendukung 1-2 kalimat
    "cta_text": string,                 // WAJIB — teks tombol, mis. "Pesan Sekarang"
    "cta_link": "#",                    // WAJIB — "#" untuk WhatsApp otomatis
    "image_url": "",                    // kosongkan selalu
    "align": "center" | "split",        // DESAIN: "center" = teks tengah; "split" = teks kiri + elemen kanan (lebih dinamis)
    "style": "gradient" | "dark" | "light"
      // DESAIN: "gradient" = bg brand berwarna (default, paling menarik)
      //         "dark"     = bg gelap/navy (elegan, cocok untuk premium/company profile)
      //         "light"    = bg putih/terang (bersih, cocok jika halaman punya banyak warna)
  }`,

  featured_products: `featured_products: {
    "title": string,                    // WAJIB — mis. "Produk Terlaris"
    "product_ids": [],                  // SELALU kosong []
    "layout": "grid-2" | "grid-3" | "grid-4"
      // DESAIN: "grid-2" untuk 1-2 produk unggulan; "grid-3" paling umum; "grid-4" untuk katalog besar
  }`,

  banner: `banner: {
    "image_url": "",                    // kosongkan
    "link"?: string
  }`,

  testimonial: `testimonial: {
    "title": string,                    // WAJIB — mis. "Kata Mereka"
    "items": [                          // WAJIB — tepat 3 item dengan nama Indonesia wajar
      { "name": string, "text": string, "rating": 5 },
      { "name": string, "text": string, "rating": 5 },
      { "name": string, "text": string, "rating": 4 }
    ],
    "layout": "grid" | "highlight"
      // DESAIN: "grid"      = 3 kartu sejajar (default, simpel)
      //         "highlight" = kartu pertama besar + 2 kecil (lebih visual, pakai jika testimonial pertama paling kuat)
  }`,

  about: `about: {
    "title": string,                    // WAJIB — mis. "Tentang Kami" / "Siapa Kami"
    "content": string,                  // WAJIB — 2-3 paragraf, pisahkan dengan \\n\\n
    "layout": "split" | "centered"
      // DESAIN: "split"    = heading kiri, konten kanan — cocok untuk company profile, modern
      //         "centered" = semua di tengah — lebih simpel, cocok untuk toko kecil / personal brand
  }`,

  features: `features: {
    "title": string,                    // WAJIB — mis. "Kenapa Pilih Kami?"
    "items": [                          // WAJIB — tepat 3 item
      { "title": string, "description": string },
      { "title": string, "description": string },
      { "title": string, "description": string }
    ],
    "variant": "cards" | "numbered" | "icon_left",
      // DESAIN: "cards"     = kotak kartu grid (default, universal)
      //         "numbered"  = list bernomor vertikal (cocok untuk langkah-langkah / cara kerja)
      //         "icon_left" = ikon kiri, teks kanan (lebih editorial, cocok untuk landing page)
    "bg": "muted" | "white" | "primary"
      // DESAIN: "muted"   = bg abu terang (default, kontras dengan section putih)
      //         "white"   = bg putih (pakai jika section sebelum/sesudah sudah berwarna)
      //         "primary" = bg brand — sangat eye-catching, pakai max 1x per halaman
  }`,

  cta: `cta: {
    "title": string,                    // WAJIB — kalimat ajakan kuat
    "subtitle": string,                 // WAJIB — kalimat pendukung
    "button_text": string,              // WAJIB — mis. "Hubungi via WhatsApp"
    "button_link": "#",                 // WAJIB — "#" untuk WhatsApp otomatis
    "variant": "solid" | "gradient" | "outline"
      // DESAIN: "solid"    = bg brand solid (default, paling umum)
      //         "gradient" = gradient brand ke gelap (lebih premium/dramatis, cocok di akhir halaman)
      //         "outline"  = bg putih + border brand (lebih halus, cocok jika halaman sudah banyak warna)
  }`,

  contact: `contact: {
    "address"?: string,
    "phone"?: string,                   // isi dari nomor WhatsApp jika tersedia
    "email"?: string,
    "hours": string,                    // WAJIB — mis. "Senin-Sabtu, 08.00-17.00 WIB"
    "map_embed_url"?: string            // kosongkan
  }`,

  faq: `faq: {
    "title": string,                    // WAJIB — mis. "Pertanyaan Umum"
    "items": [                          // WAJIB — tepat 3 item
      { "question": string, "answer": string },
      { "question": string, "answer": string },
      { "question": string, "answer": string }
    ],
    "variant": "accordion" | "list"
      // DESAIN: "accordion" = lipat/buka (default, cocok untuk jawaban panjang)
      //         "list"      = semua tampil sekaligus di grid 2-kolom (cocok untuk jawaban singkat)
  }`,

  product_highlight: `product_highlight: {
    "product_id": "",                   // SELALU kosong ""
    "headline": string,                 // WAJIB — mis. "Produk Unggulan Kami"
    "layout": "default" | "reversed"
      // DESAIN: "default"  = gambar kiri, teks kanan
      //         "reversed" = teks kiri, gambar kanan (variasikan jika ada 2 product_highlight di halaman)
  }`,
};

/**
 * General senior-UI/UX reasoning principles the AI must apply itself —
 * not a fixed template. It decides which blocks to use, how many, in what
 * order, and which design variant per block, based on the specific business.
 */
const DESIGN_PRINCIPLES = `
PRINSIP DESAIN (terapkan sendiri sesuai konteks bisnis — JANGAN asal pilih opsi pertama atau meniru contoh secara membabi buta):
- Section pertama SEBAIKNYA "hero" — ini kesan pertama. Pilih style sesuai karakter brand: "dark" untuk kesan premium/formal, "gradient" untuk energik/menarik perhatian, "light" untuk bersih/personal.
- Variasikan bg antar section yang berdekatan ("muted" / "white" / "primary") supaya halaman tidak monoton — hindari dua section berurutan dengan bg sama.
- bg "primary" sangat mencolok — pakai MAKSIMAL SATU KALI per halaman, di section yang paling ingin ditonjolkan.
- layout "highlight" (testimonial) hanya kalau ada satu testimoni yang jauh lebih kuat untuk ditonjolkan; kalau semua setara, pakai "grid".
- variant "numbered" (features) cocok untuk proses/cara kerja bertahap; "icon_left" untuk poin gaya editorial/landing page; "cards" untuk daftar keunggulan yang setara.
- Section terakhir SEBAIKNYA ajakan bertindak yang jelas (cta atau contact) — jangan tutup halaman dengan section pasif seperti "about" atau "banner".
- Sesuaikan jumlah & urutan section dengan strategi bisnis: penawaran tunggal yang butuh keyakinan ekstra (mis. produk baru/mahal) lebih butuh testimonial+faq sebelum cta; bisnis yang sudah dikenal bisa lebih ringkas.
- Jangan mengulang tipe blok yang sama kecuali ada alasan jelas (mis. 2x product_highlight untuk 2 produk berbeda) — kalau diulang, variasikan layout-nya (mis. "default" lalu "reversed").
- Jumlah section wajar: 4-6 untuk halaman utama (home), 2-4 untuk halaman lain — jangan gunakan semua blok yang tersedia sekaligus kalau tidak relevan, dan jangan terlalu sedikit sehingga halaman terasa kosong.
`;

/**
 * Business-strategy hints per site type — describes the GOAL of the page,
 * not a fixed block sequence. The AI chooses which allowed blocks best serve
 * that goal for this specific business.
 */
const SITE_TYPE_STRATEGY: Record<SiteType, string> = {
  storefront:
    "Toko dengan katalog produk. Tujuan: pengunjung mengenal brand lalu tertarik melihat/membeli produk. Pertimbangkan: perkenalan brand, produk unggulan, alasan kepercayaan (keunggulan/testimoni), lalu ajakan belanja.",
  sales_page:
    "Halaman tunggal menjual SATU produk/penawaran, biasanya lewat WhatsApp. Alur yang efektif: tarik perhatian dengan masalah/keunggulan utama, tunjukkan produknya, yakinkan calon pembeli (keunggulan/bukti sosial), atasi keraguan, baru dorong beli. Sesuaikan seberapa banyak 'meyakinkan' dibutuhkan dengan seberapa besar keputusan pembelian ini bagi calon pembeli.",
  landing_page:
    "Halaman untuk mengumpulkan minat terhadap satu penawaran (kursus/layanan/event). Fokus jelaskan manfaat & isi penawaran, bangun kepercayaan, jawab keraguan umum, lalu dorong tindakan (daftar/hubungi).",
  company_profile:
    "Situs profil perusahaan — tujuan membangun kredibilitas, BUKAN jualan langsung. Fokus cerita perusahaan, keunggulan/layanan, bukti kepercayaan dari klien, dan cara dihubungi. Tone lebih formal dibanding jenis situs lain.",
};

const PAGE_TYPE_GUIDE: Record<string, string> = {
  home: "Halaman BERANDA — pengenalan, produk/layanan unggulan, daya tarik utama.",
  about: "Halaman TENTANG KAMI — cerita perusahaan, visi/misi, nilai, alasan dipercaya.",
  contact: "Halaman KONTAK — cara menghubungi, jam operasional.",
};

/** Strategy hints for non-home pages — same intent regardless of site type. */
const PAGE_TYPE_STRATEGY: Record<string, string> = {
  about:
    "Ceritakan siapa bisnis ini dan kenapa layak dipercaya. Pertimbangkan: cerita/latar belakang, keunggulan atau nilai yang dipegang, bukti sosial (testimoni) — pilih & urutkan mana yang paling kuat untuk bisnis ini.",
  contact:
    "Permudah calon pelanggan menghubungi. Isi info kontak & jam operasional selengkap mungkin, dan tutup dengan ajakan menghubungi yang jelas.",
};

const PLACEHOLDER_EXAMPLES: Record<SiteType, string> = {
  storefront:
    "Contoh: Toko fashion lokal menjual kaos distro dan jaket streetwear, target anak muda 18-30 tahun, bahan premium, harga 150-400rb.",
  sales_page:
    "Contoh: Jual suplemen herbal pelangsing alami, sudah terjual 5.000+ botol, aman tanpa efek samping, garansi uang kembali 30 hari.",
  landing_page:
    "Contoh: Kursus desain grafis online untuk pemula, 30 modul video, sertifikat, mentor berpengalaman, harga promo Rp 299.000.",
  company_profile:
    "Contoh: PT Maju Bersama, perusahaan konsultan IT berdiri 2010, melayani 200+ klien korporat, spesialis transformasi digital.",
};

export function buildContentPrompt(opts: {
  storeName: string;
  siteType: SiteType;
  industry: Industry;
  businessDescription: string;
  whatsappNumber?: string | null;
  pageType?: string;
}): string {
  const config = SITE_TYPE_CONFIG[opts.siteType];
  const pageType = opts.pageType ?? "home";
  const industryInfo = INDUSTRY_CONTENT[opts.industry];

  // Filter allowed blocks for non-home pages
  let allowedBlocks: BlockType[] = config.allowedBlocks;
  if (pageType === "about") {
    allowedBlocks = config.allowedBlocks.filter((b) =>
      ["about", "features", "testimonial", "banner"].includes(b)
    );
  } else if (pageType === "contact") {
    allowedBlocks = config.allowedBlocks.filter((b) =>
      ["contact", "cta"].includes(b)
    );
  }

  const schemaLines = allowedBlocks.map((b) => BLOCK_SCHEMA_DOCS[b]).join("\n\n");
  const pageGuide = PAGE_TYPE_GUIDE[pageType] ?? PAGE_TYPE_GUIDE["home"];
  const strategyHint =
    pageType === "home"
      ? SITE_TYPE_STRATEGY[opts.siteType]
      : PAGE_TYPE_STRATEGY[pageType] ?? `Sesuaikan section dengan tujuan halaman ini: ${pageGuide}`;

  const descriptionFallback = PLACEHOLDER_EXAMPLES[opts.siteType];

  return `Kamu adalah Senior UI/UX Designer fullstack untuk UMKM Indonesia — bukan sekadar penulis konten.
Platform klikweb.id merender halaman dari JSON — TIDAK ada HTML/CSS bebas.
Tugasmu: bertindak sebagai perancang halaman sungguhan — putuskan sendiri blok mana yang dipakai (dari daftar yang tersedia), urutannya, berapa banyak, dan varian desain tiap blok — lalu isi kontennya. JANGAN ikuti template tetap; setiap keputusan harus punya alasan yang masuk akal untuk bisnis spesifik ini.

═══════════════════════════════════════
DATA BISNIS
═══════════════════════════════════════
- Nama bisnis : ${opts.storeName}
- Jenis situs : ${config.label} — ${config.description}
- Kategori    : ${industryInfo.label} (${industryInfo.description})
- Deskripsi   : ${opts.businessDescription.trim() || descriptionFallback}
- WhatsApp    : ${opts.whatsappNumber?.trim() || "(tidak tersedia)"}

═══════════════════════════════════════
HALAMAN: ${pageGuide}
═══════════════════════════════════════
STRATEGI: ${strategyHint}

BLOK YANG TERSEDIA (pilih sebagian sesuai kebutuhan, JANGAN wajib semua): ${allowedBlocks.join(", ")}
${DESIGN_PRINCIPLES}
═══════════════════════════════════════
ATURAN WAJIB
═══════════════════════════════════════
1. Output HANYA satu blok JSON array. Tidak ada teks di luar JSON.
2. Bahasa Indonesia. Gaya: hangat, persuasif, profesional, sesuai UMKM.
3. DILARANG: HTML, markdown, emoji, klaim yang tidak disebutkan.
4. Field bertanda WAJIB harus diisi — jangan kosongkan.
5. Field "image_url" / "map_embed_url" selalu dikosongkan atau dihapus.
6. Hanya gunakan tipe blok dari daftar BLOK YANG TERSEDIA di atas.
7. Nama field HARUS persis sama — jangan terjemahkan.
8. Untuk field desain (align/style/layout/variant/bg): WAJIB diisi berdasarkan pertimbanganmu sendiri sebagai senior UI/UX, ikuti PRINSIP DESAIN di atas — bukan asal pilih opsi pertama di skema.
9. "id" format "blk-[type]-[nomor]". "order" mulai 1 berurutan sesuai urutan yang kamu putuskan.

═══════════════════════════════════════
SKEMA JSON (opsi desain yang tersedia per tipe blok)
═══════════════════════════════════════
${schemaLines}

═══════════════════════════════════════
FORMAT OUTPUT
═══════════════════════════════════════
[
  { "id": "blk-hero-1", "type": "hero", "order": 1, "data": { "title": "...", "align": "split", "style": "gradient", ... } },
  { "id": "blk-features-2", "type": "features", "order": 2, "data": { "title": "...", "variant": "cards", "bg": "muted", ... } }
]

Mulai output JSON sekarang:`;
}

export function buildSingleBlockPrompt(opts: {
  storeName: string;
  industry: Industry;
  businessDescription: string;
  blockType: BlockType;
}): string {
  const industryInfo = INDUSTRY_CONTENT[opts.industry];
  const schemaLine = BLOCK_SCHEMA_DOCS[opts.blockType];

  return `Kamu adalah Senior UI/UX Designer fullstack untuk UMKM Indonesia — bukan sekadar penulis konten.
Tugasmu: menghasilkan JSON data konten DAN memilih varian desain (align/style/layout/variant/bg, sesuai yang tersedia di skema) HANYA untuk satu bagian (section) bertipe "${opts.blockType}", berdasarkan pertimbanganmu sendiri untuk bisnis ini — bukan asal pilih opsi pertama di skema.

DATA BISNIS:
- Nama bisnis : ${opts.storeName}
- Kategori    : ${industryInfo.label} (${industryInfo.description})
- Deskripsi   : ${opts.businessDescription.trim() || "Isi konten yang menarik dan profesional."}

ATURAN WAJIB:
1. Output HANYA object JSON untuk field "data", tanpa ada teks di luarnya.
2. Bahasa Indonesia. Gaya: hangat, persuasif, profesional.
3. Field "image_url" / "map_embed_url" harus berupa string kosong "".
4. Harus persis mengikuti SKEMA di bawah (nama field & opsi enum tidak boleh diubah).

SKEMA JSON UNTUK "data" DARI TIPE "${opts.blockType}":
${schemaLine}

Berikan hanya object JSON yang merepresentasikan isi dari properti "data" tersebut:`;
}

