export const INDUSTRIES = ["fashion", "food_beverage", "jasa", "kecantikan", "umum"] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const DEFAULT_INDUSTRY: Industry = "umum";

interface IndustryContent {
  label: string;
  description: string;
  heroSubtitle: (storeName: string) => string;
  featuredProductsTitle: string;
  featuresTitle: string;
  featureItems: { title: string; description: string }[];
  aboutContent: (storeName: string) => string;
}

export const INDUSTRY_CONTENT: Record<Industry, IndustryContent> = {
  fashion: {
    label: "Fashion & Aksesoris",
    description: "Pakaian, sepatu, tas, dan aksesoris.",
    heroSubtitle: () => "Koleksi terbaru dengan kualitas terbaik, langsung dari produsen.",
    featuredProductsTitle: "Koleksi Terbaru",
    featuresTitle: "Kenapa Belanja di Sini?",
    featureItems: [
      { title: "Bahan Berkualitas", description: "Dipilih dari material terbaik agar nyaman dipakai." },
      { title: "Model Terkini", description: "Update koleksi mengikuti tren terbaru." },
    ],
    aboutContent: (storeName) =>
      `${storeName} adalah brand fashion lokal yang berfokus pada kualitas dan kenyamanan. Setiap produk dipilih dan diproduksi dengan standar yang ketat agar pelanggan puas.`,
  },
  food_beverage: {
    label: "Makanan & Minuman",
    description: "Kuliner, kafe, katering, oleh-oleh.",
    heroSubtitle: () => "Dibuat fresh setiap hari dengan bahan pilihan.",
    featuredProductsTitle: "Menu Favorit",
    featuresTitle: "Kenapa Pilih Kami?",
    featureItems: [
      { title: "Bahan Segar", description: "Dipilih dan diolah setiap hari, tanpa pengawet." },
      { title: "Higienis", description: "Proses produksi menjaga standar kebersihan." },
    ],
    aboutContent: (storeName) =>
      `${storeName} menyajikan makanan & minuman dengan resep pilihan dan bahan segar setiap hari. Kami percaya kualitas rasa dimulai dari bahan terbaik.`,
  },
  jasa: {
    label: "Jasa & Konsultan",
    description: "Konsultasi, kursus, jasa profesional.",
    heroSubtitle: () => "Solusi terpercaya untuk kebutuhan bisnis dan pribadi Anda.",
    featuredProductsTitle: "Layanan Kami",
    featuresTitle: "Kenapa Pilih Kami?",
    featureItems: [
      { title: "Berpengalaman", description: "Ditangani tim yang sudah teruji di bidangnya." },
      { title: "Respon Cepat", description: "Konsultasi dan bantuan yang cepat tanggap." },
    ],
    aboutContent: (storeName) =>
      `${storeName} menyediakan jasa profesional yang membantu klien menyelesaikan kebutuhan mereka dengan cepat dan tepat, didukung tim berpengalaman.`,
  },
  kecantikan: {
    label: "Kecantikan & Perawatan",
    description: "Skincare, kosmetik, salon, spa.",
    heroSubtitle: () => "Rawat dirimu dengan produk yang aman dan teruji.",
    featuredProductsTitle: "Produk Andalan",
    featuresTitle: "Kenapa Pilih Kami?",
    featureItems: [
      { title: "BPOM Terdaftar", description: "Aman digunakan dan teruji secara klinis." },
      { title: "Cocok Segala Jenis Kulit", description: "Diformulasikan untuk berbagai kebutuhan kulit." },
    ],
    aboutContent: (storeName) =>
      `${storeName} hadir untuk membantu perawatan kulit & kecantikanmu dengan produk aman, teruji, dan sesuai kebutuhan setiap pelanggan.`,
  },
  umum: {
    label: "Umum / Lainnya",
    description: "Jenis usaha lain di luar kategori di atas.",
    heroSubtitle: (storeName) => `Selamat datang di ${storeName}.`,
    featuredProductsTitle: "Produk Pilihan",
    featuresTitle: "Kenapa Pilih Kami?",
    featureItems: [
      { title: "Kualitas Terjamin", description: "Kami mengutamakan kualitas di setiap produk/layanan." },
      { title: "Pelayanan Ramah", description: "Tim kami siap membantu kebutuhan Anda." },
    ],
    aboutContent: (storeName) =>
      `${storeName} adalah usaha yang berkomitmen memberikan produk dan layanan terbaik untuk pelanggan.`,
  },
};

export function isIndustry(value: string): value is Industry {
  return (INDUSTRIES as readonly string[]).includes(value);
}
