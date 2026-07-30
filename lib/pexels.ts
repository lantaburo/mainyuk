/**
 * Pexels API wrapper — fetch satu foto representatif untuk keyword tertentu.
 * Menggunakan Pexels Free API (tidak perlu atribusi di halaman, tapi dianjurkan).
 * Docs: https://www.pexels.com/api/documentation/
 */

export interface PexelsPhoto {
  url: string;           // URL foto langsung (large2x)
  thumb: string;         // Thumbnail
  photographer: string;  // Nama fotografer
  pexelsLink: string;    // Link ke halaman Pexels (untuk atribusi)
}

const BASE = "https://api.pexels.com/v1";

/** Cari satu foto dari Pexels berdasarkan keyword. Return null jika tidak ditemukan / API key tidak ada. */
export async function fetchPexelsPhoto(
  keyword: string,
  orientation: "landscape" | "portrait" | "square" = "landscape"
): Promise<PexelsPhoto | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    query: keyword,
    per_page: "5",
    orientation,
  });

  try {
    const res = await fetch(`${BASE}/search?${params}`, {
      headers: { Authorization: apiKey },
      // Cache 24 jam untuk keyword yang sama
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const photo = data?.photos?.[0];
    if (!photo) return null;

    return {
      url: photo.src?.large2x ?? photo.src?.large ?? photo.src?.original,
      thumb: photo.src?.small,
      photographer: photo.photographer ?? "",
      pexelsLink: photo.url ?? "https://www.pexels.com",
    };
  } catch {
    return null;
  }
}

/**
 * Ekstrak keyword pencarian gambar dari konten brief section.
 * Ambil kata-kata substantif: hapus stopwords Indonesia & Inggris.
 */
export function extractImageKeyword(
  sectionName: string,
  contentOutline: string,
  businessContext: string // storeName + industry
): string {
  // Gabungkan semua teks
  const raw = `${sectionName} ${contentOutline} ${businessContext}`;

  // Stopwords dasar (Indonesia + Inggris)
  const STOP = new Set([
    "dan","atau","yang","ini","itu","untuk","dari","ke","di","dengan","pada","adalah",
    "akan","bisa","kami","kita","ada","jika","serta","dalam","oleh","juga","mereka",
    "agar","lebih","dapat","setiap","produk","layanan","section","halaman",
    "the","and","or","for","to","of","in","is","are","a","an","this","that",
    "our","we","with","from","be","will","your","it","its","as","all",
  ]);

  const words = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));

  // Ambil maksimal 4 kata unik pertama
  const unique = Array.from(new Set(words)).slice(0, 4);
  return unique.join(" ") || sectionName;
}

/** Tentukan apakah section ini butuh gambar berdasarkan nama section-nya. */
export function sectionNeedsImage(sectionName: string): boolean {
  const name = sectionName.toLowerCase();
  const NEEDS_IMAGE_KEYWORDS = [
    "hero", "banner", "header", "cover", "showcase",
    "tentang", "about", "story", "cerita", "profil",
    "galeri", "gallery", "foto", "photo", "portofolio", "portfolio",
    "team", "tim", "staff",
    "layanan", "service", "jasa",
    "promo", "penawaran", "offer",
  ];
  return NEEDS_IMAGE_KEYWORDS.some((kw) => name.includes(kw));
}
