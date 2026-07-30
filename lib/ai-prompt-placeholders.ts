import type { SiteType } from "@/lib/site-types";

/** Example business-description prompts shown as placeholders in AI page-generator inputs. */
export const SITE_TYPE_PROMPT_PLACEHOLDERS: Record<SiteType, string> = {
  storefront:
    "Contoh: Toko fashion lokal menjual kaos distro dan jaket streetwear, target anak muda 18-30 tahun, bahan premium, harga 150-400rb.",
  sales_page:
    "Contoh: Jual suplemen herbal pelangsing alami, sudah terjual 5.000+ botol, aman tanpa efek samping, garansi uang kembali 30 hari.",
  landing_page:
    "Contoh: Kursus desain grafis online untuk pemula, 30 modul video, sertifikat, mentor berpengalaman, harga promo Rp 299.000.",
  company_profile:
    "Contoh: PT Maju Bersama, perusahaan konsultan IT berdiri 2010, melayani 200+ klien korporat, spesialis transformasi digital.",
};
