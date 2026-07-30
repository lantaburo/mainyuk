/**
 * HTML Image Enricher — inject foto Pexels ke HTML hasil generate AI.
 *
 * Strategy:
 * - Parse `<section>` tags berurutan, cocokkan dengan brief.sections[i]
 * - Untuk section yang butuh gambar (hero, about, banner, dll):
 *   → Jika sudah ada <img> atau background-image → skip
 *   → Jika belum → inject sebagai photo-overlay div di dalam section
 */

import type { DesignBrief } from "@/lib/ai-html-schema";
import { fetchPexelsPhoto, extractImageKeyword, sectionNeedsImage } from "@/lib/pexels";

export interface EnrichResult {
  html: string;
  imagesInjected: number;
  /** Array foto yang digunakan, untuk ditampilkan sebagai info di wizard */
  photos: { sectionName: string; photographer: string; pexelsLink: string }[];
}

/**
 * Inject foto Pexels ke dalam HTML per section.
 * Dipanggil server-side setelah HTML di-generate oleh AI.
 */
export async function enrichHtmlWithImages(
  html: string,
  brief: DesignBrief,
  storeName: string
): Promise<EnrichResult> {
  if (!process.env.PEXELS_API_KEY) {
    return { html, imagesInjected: 0, photos: [] };
  }

  // Split HTML menjadi chunks berdasarkan <section...>
  // Format: ["preamble", "<section...>...</section>", "between", "<section>...</section>", ...]
  const SECTION_RE = /(<section[\s\S]*?<\/section>)/gi;
  const parts = html.split(SECTION_RE);

  let imagesInjected = 0;
  const photos: EnrichResult["photos"] = [];

  // Kumpulkan semua section dari split (index ganjil = section content)
  let sectionIdx = 0;
  const enrichedParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Bukan tag section — pass through
    if (!part.match(/^<section/i)) {
      enrichedParts.push(part);
      continue;
    }

    // Ini adalah sebuah <section>...</section>
    const briefSection = brief.sections[sectionIdx];
    sectionIdx++;

    // Cek apakah sudah punya gambar
    const hasImg = /<img\s/i.test(part);
    const hasBgImage = /background-image\s*:/i.test(part);
    const hasBgPhoto = /background\s*:\s*url\(/i.test(part);

    if (hasImg || hasBgImage || hasBgPhoto) {
      // Section sudah punya gambar, skip
      enrichedParts.push(part);
      continue;
    }

    // Perlu gambar?
    if (!briefSection || !sectionNeedsImage(briefSection.name)) {
      enrichedParts.push(part);
      continue;
    }

    // Determine orientation: hero/banner → landscape, about/profil → portrait
    const name = briefSection.name.toLowerCase();
    const orientation =
      name.includes("tentang") || name.includes("about") || name.includes("profil") || name.includes("team") || name.includes("tim")
        ? "portrait"
        : "landscape";

    // Buat keyword dari brief section
    const keyword = extractImageKeyword(
      briefSection.name,
      briefSection.contentOutline,
      storeName
    );

    // Fetch dari Pexels
    const photo = await fetchPexelsPhoto(keyword, orientation);
    if (!photo) {
      enrichedParts.push(part);
      continue;
    }

    // Inject sebagai photo-overlay: div dengan position absolute, full cover, overlay gelap
    // Disisipkan sebagai child pertama dari <section...>
    const photoOverlay = `<div data-klikweb-photo style="position:absolute;inset:0;background-image:url('${photo.url}');background-size:cover;background-position:center;z-index:0;pointer-events:none;" aria-hidden="true"></div>`;

    // Pastikan section punya position:relative agar overlay bisa absolute
    // Inject tepat setelah tag pembuka <section ...>
    const enriched = part.replace(
      /(<section[^>]*>)/i,
      (match) => {
        // Tambah position:relative ke style section jika belum ada
        if (/style\s*=\s*["']/i.test(match)) {
          // Ada style existing
          return match.replace(
            /style\s*=\s*["']([^"']*?)["']/i,
            (styleMatch, existing) => {
              if (/position\s*:/i.test(existing)) return styleMatch; // sudah ada position
              return styleMatch.replace(existing, `${existing};position:relative;overflow:hidden`);
            }
          );
        } else {
          // Belum ada style
          return match.replace(/(<section)(\s)/i, `$1 style="position:relative;overflow:hidden"$2`);
        }
      }
    ).replace(
      /(<section[^>]*>)/i,
      `$1${photoOverlay}`
    );

    enrichedParts.push(enriched);
    imagesInjected++;
    photos.push({
      sectionName: briefSection.name,
      photographer: photo.photographer,
      pexelsLink: photo.pexelsLink,
    });
  }

  return {
    html: enrichedParts.join(""),
    imagesInjected,
    photos,
  };
}
