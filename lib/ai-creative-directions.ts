/**
 * Left to itself, the model's "creative" choice converges on the same few
 * safe defaults per industry regardless of temperature — negative rules
 * ("hindari pola X") just push it onto whatever the next-safest pattern is.
 * Picking one of these at random and forcing a generation to commit to it
 * moves variety control out of the model's hands and into ours. Shared by
 * both the HTML-brief generator and the block-based page generator.
 */
export interface CreativeDirection {
  name: string;
  guidance: string;
}

export const CREATIVE_DIRECTIONS: CreativeDirection[] = [
  {
    name: "Editorial Majalah",
    guidance: "Warna & mood diambil dari palet fotografi editorial (netral hangat + satu aksen tajam, bukan pastel). Nada tulisan seperti caption majalah desain: observasional, percaya diri, sedikit jaim.",
  },
  {
    name: "Artisanal & Bahan Mentah",
    guidance: "Warna HARUS diturunkan dari tekstur/bahan/proses nyata di deskripsi bisnis (mis. warna kayu, benang, rempah, tanah liat) — bukan warna abstrak yang 'terlihat bagus'. Nada tulisan seperti pengrajin menjelaskan prosesnya sendiri.",
  },
  {
    name: "Tech-Forward / Swiss Grid",
    guidance: "Palet nyaris monokrom (1-2 netral) + satu warna sinyal tajam (mis. hijau terminal, biru elektrik, kuning peringatan). Nada tulisan presisi, ringkas, seperti dokumentasi produk — bukan copywriting jualan.",
  },
  {
    name: "Maximalist Pop",
    guidance: "Warna berani & saturasi tinggi, kombinasi yang jarang dipasangkan (bukan skema warna 'aman' dari color wheel standar). Nada tulisan energik, sedikit jenaka, berani buat pernyataan.",
  },
  {
    name: "Kontemplatif Minimal",
    guidance: "Palet nyaris satu warna dengan satu aksen sangat halus, banyak ruang negatif tersirat lewat pilihan warna netral yang tidak generik (hindari putih/abu polos). Nada tulisan tenang, singkat, tidak berusaha keras meyakinkan.",
  },
  {
    name: "Retro Lokal",
    guidance: "Warna terinspirasi era atau tempat spesifik Indonesia (mis. warna signage toko lawas, kain daerah, iklan cetak 90an) — sebutkan sumber inspirasinya secara implisit lewat pilihan warna. Nada tulisan hangat dan personal, seperti cerita dari pemilik toko.",
  },
  {
    name: "Klinis & Terpercaya",
    guidance: "Palet dingin-terkontrol (biru/abu/putih) diseimbangkan SATU warna hangat sebagai penanda kepercayaan/manusiawi. Nada tulisan faktual, spesifik ke angka/proses/data — hindari klaim emosional berlebihan.",
  },
  {
    name: "Nocturnal / After-Dark",
    guidance: "Dasar gelap dominan dengan SATU aksen neon-lembut (bukan neon terang generik). Nada tulisan percaya diri dan eksklusif, seperti mengundang ke sesuatu yang tidak untuk semua orang.",
  },
  {
    name: "Organik & Earthy",
    guidance: "Warna diambil dari elemen alam yang SPESIFIK ke lokasi/produk bisnis ini (bukan hijau-krem generik 'alami') — sebut alasan konkretnya. Nada tulisan bersahaja, tidak terburu-buru.",
  },
  {
    name: "Geometris Berani",
    guidance: "Blok warna solid non-gradient, palet reinterpretasi modern dari elemen budaya/lokal yang relevan ke bisnis ini. Nada tulisan tegas dan lugas, kalimat pendek-pendek.",
  },
];

export function pickCreativeDirection(): CreativeDirection {
  return CREATIVE_DIRECTIONS[Math.floor(Math.random() * CREATIVE_DIRECTIONS.length)];
}
