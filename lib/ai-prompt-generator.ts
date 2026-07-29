import { SITE_TYPE_CONFIG, type SiteType, type BlockType } from "@/lib/site-types";
import { INDUSTRY_CONTENT, type Industry } from "@/lib/industry-content";

const BLOCK_SCHEMA_DOCS: Record<BlockType, string> = {
  hero: `hero: { "title": string, "subtitle"?: string, "image_url"?: string, "cta_text"?: string, "cta_link"?: string }`,
  featured_products: `featured_products: { "title": string, "product_ids": [], "layout": "grid-2" | "grid-3" | "grid-4" }  // product_ids selalu dikosongkan []`,
  banner: `banner: { "image_url": string, "link"?: string }`,
  testimonial: `testimonial: { "title"?: string, "items": [{ "name": string, "text": string, "rating": 1-5 }] }  // buat 2-3 item`,
  about: `about: { "title": string, "content": string }`,
  features: `features: { "title"?: string, "items": [{ "title": string, "description": string }] }  // buat 2-3 item`,
  cta: `cta: { "title": string, "subtitle"?: string, "button_text": string, "button_link": string }  // isi button_link dengan tepat "#" untuk tombol WhatsApp otomatis`,
  contact: `contact: { "address"?: string, "phone"?: string, "email"?: string, "hours"?: string, "map_embed_url"?: string }`,
  faq: `faq: { "title"?: string, "items": [{ "question": string, "answer": string }] }  // buat 2-3 item`,
  product_highlight: `product_highlight: { "product_id": "", "headline"?: string }  // product_id selalu dikosongkan ""`,
};

export function buildContentPrompt(opts: {
  storeName: string;
  siteType: SiteType;
  industry: Industry;
  businessDescription: string;
  whatsappNumber?: string | null;
}): string {
  const config = SITE_TYPE_CONFIG[opts.siteType];
  const schemaLines = config.allowedBlocks.map((b) => `- ${BLOCK_SCHEMA_DOCS[b]}`).join("\n");
  const blockList = config.allowedBlocks.join(", ");
  const pageLabel = config.multiPage ? "beranda (home)" : "halaman utama";

  return `Kamu membantu menulis isi (konten) halaman toko online di platform klikweb.id.
Sistem ini TIDAK menerima HTML/CSS bebas — semua tampilan dirender dari data JSON terstruktur
lewat komponen yang sudah ditentukan. Tugasmu murni mengisi teks/data sesuai skema di bawah.

DATA TOKO
- Nama toko: ${opts.storeName}
- Jenis situs: ${config.label} (${opts.siteType})
- Kategori bisnis: ${INDUSTRY_CONTENT[opts.industry].label}
- Deskripsi bisnis: ${opts.businessDescription.trim() || "(tidak diisi, gunakan asumsi wajar dari kategori bisnis)"}
- Nomor WhatsApp: ${opts.whatsappNumber?.trim() || "(tidak diisi)"}

ATURAN
1. Jawab HANYA dengan satu blok kode JSON array, tanpa teks pembuka/penutup/penjelasan di luar JSON.
2. Semua teks berbahasa Indonesia, gaya persuasif tapi jujur, sesuai untuk UMKM.
3. Jangan sisipkan HTML, markdown, atau emoji di dalam nilai teks.
4. Jangan mengarang klaim sertifikasi/BPOM atau data kontak yang tidak diberikan di atas.
5. Hanya boleh memakai tipe block berikut: ${blockList}. Jangan memakai tipe lain.
6. Ikuti persis nama field (key) pada skema — jangan diterjemahkan atau diubah namanya.

SKEMA BLOCK YANG BOLEH DIPAKAI
${schemaLines}

FORMAT OUTPUT
Array block, urutkan lewat field "order" mulai dari 1, field "id" bebas asal unik dan berbeda tiap block. Contoh bentuk:
[
  { "id": "block-hero", "type": "hero", "order": 1, "data": { "title": "...", "subtitle": "..." } }
]

TUGAS
Buatkan isi lengkap ${pageLabel} untuk toko di atas, pilih 3-4 tipe block yang paling relevan dari daftar yang diizinkan.`;
}
