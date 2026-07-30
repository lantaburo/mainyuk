import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import { INDUSTRY_CONTENT, type Industry } from "@/lib/industry-content";
import type { DesignBrief } from "@/lib/ai-html-schema";

/**
 * Tahap 2: turn a short free-text business description into a structured
 * design brief (goal, audience, palette, typography, section-by-section
 * outline) — the "perbaiki prompt" step, so HTML generation works from a
 * rich blueprint instead of an ambiguous one-liner.
 */
export function buildBriefPrompt(opts: {
  storeName: string;
  siteType: SiteType;
  industry: Industry;
  businessDescription: string;
  targetAudience?: string | null;
}): string {
  const config = SITE_TYPE_CONFIG[opts.siteType];
  const industryInfo = INDUSTRY_CONTENT[opts.industry];

  return `Kamu adalah web design brief writer senior. Tugasmu: ubah deskripsi bisnis singkat menjadi blueprint desain terstruktur untuk sebuah halaman web — BUKAN membuat halamannya, hanya blueprint-nya.

DATA BISNIS:
- Nama bisnis   : ${opts.storeName}
- Jenis situs   : ${config.label} — ${config.description}
- Kategori      : ${industryInfo.label} (${industryInfo.description})
- Deskripsi     : ${opts.businessDescription.trim()}
- Segmen pasar  : ${opts.targetAudience?.trim() || "(tidak disebutkan — simpulkan dari deskripsi & kategori)"}

Susun blueprint yang mempertimbangkan segmen pasar di atas: kelas ekonomi, usia dominan, gaya komunikasi, dan konteks lokal/nasional/internasional — semua ini harus memengaruhi palet warna, tipografi, dan nada tulisan yang kamu rekomendasikan.

ATURAN WAJIB:
1. Output HANYA satu object JSON, tanpa teks lain di luar JSON.
2. Bahasa Indonesia untuk semua isi teks (goal, targetAudience, tone, nama & isi section).
3. Warna di "colorPalette" harus kode hex valid (mis. "#0f766e").
4. "sections" minimal 3, maksimal 7 — urutkan sesuai alur yang paling masuk akal untuk mencapai tujuan halaman (goal).

FORMAT OUTPUT (ikuti struktur ini persis):
{
  "goal": "tujuan utama halaman ini, 1 kalimat",
  "targetAudience": "ringkasan segmen pasar yang disasar",
  "colorPalette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "typography": { "heading": "gaya font heading, mis. 'sans-serif tebal & modern'", "body": "gaya font body" },
  "tone": "gaya bahasa/nada copy, mis. 'santai & akrab' atau 'formal & profesional'",
  "sections": [
    { "name": "nama section, mis. Hero", "purpose": "tujuan section ini", "contentOutline": "garis besar konten/copy yang akan diisi di section ini" }
  ]
}

Mulai output JSON sekarang:`;
}

/**
 * Tahap 3: turn a (possibly user-edited) design brief into a single
 * self-contained HTML body fragment. This is injected into the existing
 * [store]/layout.tsx shell (header/footer/cart untouched), so it must NOT
 * include <html>/<head>/<body>/<script>/<iframe>/<form> — Tailwind utility
 * classes and the store's existing --store-* CSS variables are available.
 */
export function buildHtmlFromBriefPrompt(
  brief: DesignBrief,
  opts: {
    storeName: string;
    siteType: SiteType;
    whatsappNumber?: string | null;
  }
): string {
  const config = SITE_TYPE_CONFIG[opts.siteType];
  const wa = opts.whatsappNumber?.trim();
  const waLink = wa ? `https://wa.me/${wa.replace(/[^0-9]/g, "")}` : null;
  const needsProductWidget = opts.siteType === "storefront" || opts.siteType === "sales_page";

  return `Kamu adalah Senior UI/UX Designer & front-end developer. Tugasmu: tulis SATU fragment HTML (bukan dokumen HTML lengkap) yang mengimplementasikan blueprint desain berikut untuk halaman "${opts.storeName}" (${config.label}).

BLUEPRINT DESAIN:
${JSON.stringify(brief, null, 2)}

ATURAN WAJIB (pelanggaran akan ditolak sistem):
1. Output HANYA HTML mentah, TANPA markdown fence, TANPA komentar, TANPA teks penjelasan di luar HTML.
2. DILARANG KERAS menulis tag <html>, <head>, <body>, <script>, <iframe>, <form>, <style>, atau atribut "on*" (onclick dkk) — fragment ini di-suntikkan ke halaman yang sudah punya header/footer sendiri.
3. Gunakan Tailwind CSS utility classes untuk layout/spacing/warna/tipografi (class biasa seperti "px-6 py-24 flex flex-col gap-4" dst — SUDAH tersedia di halaman, tidak perlu di-import).
4. Untuk warna brand, gunakan CSS variable yang SUDAH di-set oleh sistem lewat inline style, contoh: style="color: var(--store-primary)" atau style="background: var(--store-primary)" — supaya konsisten dengan tema toko, JANGAN hardcode warna brand di luar palet blueprint di atas.
5. Setiap section dari blueprint.sections harus jadi satu <section> dengan urutan yang sama seperti di blueprint.
6. Semua teks (headline, deskripsi, label tombol) HARUS bahasa Indonesia, sesuai "tone" di blueprint, dan sesuai "contentOutline" tiap section — JANGAN tulis placeholder seperti "Lorem ipsum" atau "[isi di sini]".
7. Link tombol boleh pakai href="#" untuk yang tidak diketahui tujuannya.${
    waLink
      ? `\n8. Untuk tombol ajakan (CTA) hubungi bisnis, gunakan href="${waLink}" (link WhatsApp resmi bisnis ini).`
      : ""
  }${
    needsProductWidget
      ? `\n9. Untuk section yang menampilkan produk (mis. "Produk Unggulan"/"Katalog"), JANGAN buat kartu produk sendiri — taruh tag ini SEBAGAI SECTION TERSENDIRI, sejajar dengan section lain (JANGAN ditaruh di dalam section lain): <div data-klikweb-widget="featured-products" class="px-6 py-16"></div> (boleh ubah class untuk spacing, tapi jangan taruh child/isi lain di dalamnya — sistem akan menggantinya dengan grid produk asli secara otomatis).`
      : ""
  }
10. Gambar: jangan gunakan <img> dengan src palsu/placeholder acak — kalau section butuh gambar tapi tidak ada sumber gambar nyata, lewati gambar dan fokus ke tipografi/warna/layout saja.

Mulai output HTML sekarang:`;
}

/**
 * Editor "AI" tab: rewrite a single selected element per a free-text
 * instruction, without touching anything else on the page.
 */
export function buildElementEditPrompt(
  currentOuterHtml: string,
  instruction: string,
  opts: { storeName: string }
): string {
  return `Kamu adalah Senior UI/UX Designer. Tugasmu: ubah SATU elemen HTML berikut sesuai instruksi, untuk halaman milik "${opts.storeName}".

ELEMEN SAAT INI:
${currentOuterHtml}

INSTRUKSI PERUBAHAN:
${instruction.trim()}

ATURAN WAJIB:
1. Output HANYA HTML mentah untuk elemen pengganti, TANPA markdown fence, TANPA teks penjelasan.
2. Balikin TEPAT SATU elemen root dengan tag yang SAMA seperti elemen semula (jangan ganti mis. <h2> jadi <div>), kecuali instruksi eksplisit minta ganti tag.
3. DILARANG KERAS <script>, <iframe>, <form>, atau atribut "on*" (onclick dkk).
4. Boleh ubah Tailwind class, inline style (termasuk var(--store-primary) dkk untuk warna brand), dan teks di dalamnya sesuai instruksi.
5. Jangan hapus atribut "data-klikweb-widget" kalau ada di elemen semula.
6. Kalau instruksi tidak jelas/tidak mungkin dilakukan pada elemen ini, kembalikan elemen semula apa adanya.

Mulai output HTML sekarang:`;
}
