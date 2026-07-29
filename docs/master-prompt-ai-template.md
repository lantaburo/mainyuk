# Master Prompt: Generate Konten/Template untuk klikweb.id (Gemini AI / LLM lain)

Salin salah satu bagian **Mode** di bawah (sesuai kebutuhan) ke Gemini AI (atau ChatGPT/Claude lain),
lengkapi bagian `[isi di sini]`, lalu tempel hasil JSON-nya ke tempat yang disebutkan di masing-masing mode.

Sistem klikweb.id **tidak menerima HTML/CSS/kode halaman bebas** — semua tampilan toko dirender dari
data terstruktur (JSON) lewat komponen yang sudah ada. Jadi tugas AI di sini murni **mengisi teks/data**,
bukan mendesain markup baru.

---

## Aturan Umum (berlaku di semua mode)

1. Jawab **HANYA** dengan satu blok kode JSON yang valid. Tidak ada teks pembuka, penutup, atau penjelasan di luar JSON.
2. Semua teks berbahasa Indonesia, gaya bahasa persuasif tapi jujur (tidak berlebihan/clickbait), sesuai untuk UMKM.
3. Jangan menyisipkan HTML, markdown, atau emoji di dalam nilai teks.
4. Jangan mengarang nama merek pihak ketiga, klaim BPOM/sertifikasi, atau data kontak/harga — biarkan placeholder wajar jika user tidak memberi datanya.
5. Ikuti persis nama field (key) yang ditentukan — huruf besar/kecil dan `snake_case`/`camelCase` harus sama persis seperti contoh.

---

## Mode 1 — Isi Konten Halaman (blocks) untuk Satu Toko

Gunakan mode ini untuk mengisi/menulis ulang isi halaman depan (atau halaman tentang/kontak) sebuah toko.

**Info yang harus kamu lengkapi sebelum kirim ke AI:**
- Nama toko: `[isi di sini]`
- Jenis situs (`site_type`): salah satu dari `storefront` | `sales_page` | `landing_page` | `company_profile` → `[isi di sini]`
- Deskripsi singkat bisnis (produk/layanan, target pasar, keunggulan): `[isi di sini]`
- Nomor WhatsApp (opsional, untuk tombol pesan): `[isi di sini]`

**Blok yang BOLEH dipakai per jenis situs (jangan pakai di luar daftar ini):**
- `storefront` → hero, featured_products, banner, testimonial, about, features, cta
- `sales_page` → hero, product_highlight, features, testimonial, faq, cta
- `landing_page` → hero, features, banner, testimonial, faq, cta
- `company_profile` → hero, about, features, testimonial, contact, banner

**Skema tiap tipe block** (field wajib tidak boleh kosong, field dengan `?` boleh dikosongkan/`""`):

```
hero:               { title: string, subtitle?: string, image_url?: string, cta_text?: string, cta_link?: string }
featured_products:  { title: string, product_ids: [], layout: "grid-2" | "grid-3" | "grid-4" }
                     // product_ids SELALU kosongkan [] — AI tidak tahu ID produk asli
banner:              { image_url: string, link?: string }
testimonial:         { title?: string, items: [{ name: string, text: string, rating: 1-5 }] }  // buat 2-3 item
about:               { title: string, content: string }
features:            { title?: string, items: [{ title: string, description: string }] }        // buat 2-3 item
cta:                 { title: string, subtitle?: string, button_text: string, button_link: string }
                     // kalau ingin tombol otomatis buka WhatsApp, isi button_link dengan persis "#"
contact:             { address?: string, phone?: string, email?: string, hours?: string, map_embed_url?: string }
faq:                 { title?: string, items: [{ question: string, answer: string }] }            // buat 2-3 item
product_highlight:   { product_id: "", headline?: string }
                     // product_id SELALU kosongkan "" — AI tidak tahu ID produk asli
```

**Format output** (array block, urutkan sesuai `order`, `id` bebas asal unik):

```json
[
  {
    "id": "block-hero",
    "type": "hero",
    "order": 1,
    "data": { "title": "...", "subtitle": "...", "cta_text": "...", "cta_link": "#" }
  }
]
```

**Cara pasang hasilnya di klikweb.id:** buka `/dashboard/halaman`, lalu salin isi tiap `data.*` ke field yang sesuai di form editor blok (belum ada fitur "paste JSON langsung" — isi manual per field berdasarkan hasil AI ini).

---

## Mode 2 — Usulkan Preset Tampilan Visual Baru

Gunakan mode ini kalau ingin gaya visual baru selain "Modern / Klasik / Minimalis" yang sudah ada.

**Info yang harus kamu lengkapi:**
- Nama gaya yang diinginkan (mis. "elegan", "playful", "industrial"): `[isi di sini]`
- Deskripsi kesan yang diinginkan: `[isi di sini]`

**Format output:**

```json
{
  "label": "Nama Preset (mis. Elegan)",
  "description": "Satu kalimat penjelasan gaya ini untuk ditampilkan ke pemilik toko.",
  "radius": "nilai CSS border-radius, contoh: 0.75rem",
  "shadow": "nilai CSS box-shadow, contoh: 0 4px 12px -2px rgb(0 0 0 / 0.12), atau tulis none"
}
```

Catatan: sistem saat ini hanya mendukung 2 parameter visual (radius sudut + bayangan) yang otomatis diterapkan ke tombol, kartu produk, kartu testimoni, dan gambar banner — bukan warna (warna diatur terpisah lewat "Warna Tema" per toko). Hasil JSON ini perlu ditambahkan manual ke `lib/templates.ts` oleh developer, bukan langsung aktif di aplikasi.

---

## Mode 3 — Usulkan Starter Konten untuk Kategori Bisnis Baru

Gunakan mode ini kalau ingin menambah kategori bisnis baru (selain Fashion, Makanan & Minuman, Jasa & Konsultan, Kecantikan, Umum) beserta contoh konten otomatisnya.

**Info yang harus kamu lengkapi:**
- Nama kategori bisnis baru: `[isi di sini]`
- Contoh 1-2 nama bisnis nyata di kategori ini (untuk konteks, tidak dipakai langsung): `[isi di sini]`

**Format output:**

```json
{
  "label": "Nama Kategori (mis. Otomotif)",
  "description": "Satu kalimat penjelasan kategori ini.",
  "heroSubtitle": "Satu kalimat subtitle hero yang relevan untuk kategori ini.",
  "featuredProductsTitle": "Judul singkat untuk seksi produk (mis. Menu Favorit / Koleksi Terbaru).",
  "featuresTitle": "Judul singkat untuk seksi keunggulan (mis. Kenapa Pilih Kami?).",
  "featureItems": [
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "aboutContent": "1-2 kalimat isi 'tentang kami' generik untuk kategori ini, gunakan placeholder {storeName} untuk nama toko."
}
```

Hasil JSON ini perlu ditambahkan manual ke `lib/industry-content.ts` oleh developer (menambah satu entri baru ke daftar kategori bisnis), bukan langsung aktif di aplikasi.

---

## Ringkasan Kapan Pakai Mode Mana

| Kebutuhan | Mode |
|---|---|
| "Tolong tuliskan isi halaman toko saya" | Mode 1 |
| "Aku mau gaya visual baru di luar 3 pilihan yang ada" | Mode 2 (butuh developer memasukkannya ke kode) |
| "Aku mau kategori bisnis baru dengan starter kontennya" | Mode 3 (butuh developer memasukkannya ke kode) |
