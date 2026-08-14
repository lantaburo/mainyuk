import { PrismaClient } from "./lib/generated/prisma2/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const realQuestions = {
  "Matematika": [
    // 20 Questions for Matematika Modul 1
    { q: "Berapakah hasil dari 5 + 3?", o: ["6", "7", "8", "9"], c: 2, e: "5 ditambah 3 sama dengan 8." },
    { q: "Jika Budi memiliki 10 apel dan memakan 4 apel, berapa sisa apel Budi?", o: ["4", "5", "6", "7"], c: 2, e: "10 dikurangi 4 sama dengan 6." },
    { q: "Angka berapakah yang tepat untuk melengkapi urutan: 2, 4, 6, ..., 10?", o: ["7", "8", "9", "12"], c: 1, e: "Pola bilangan genap, setelah 6 adalah 8." },
    { q: "Sebuah persegi memiliki 4 sisi. Jika kita memiliki 2 persegi, berapa total sisinya?", o: ["4", "6", "8", "10"], c: 2, e: "2 persegi x 4 sisi = 8 sisi." },
    { q: "Mana yang lebih besar, 15 atau 21?", o: ["15", "21", "Sama besar", "Tidak ada yang benar"], c: 1, e: "21 memiliki nilai yang lebih tinggi daripada 15." },
    { q: "Hasil dari 10 - 5 adalah...", o: ["3", "4", "5", "6"], c: 2, e: "10 dikurangi 5 sama dengan 5." },
    { q: "Ibu membeli 12 butir telur. 2 telur pecah. Sisa telur yang masih utuh adalah...", o: ["8", "9", "10", "11"], c: 2, e: "12 dikurangi 2 sama dengan 10." },
    { q: "Angka sebelum 19 adalah...", o: ["17", "18", "20", "21"], c: 1, e: "Angka sebelum 19 adalah 18." },
    { q: "Satu minggu ada berapa hari?", o: ["5", "6", "7", "8"], c: 2, e: "Satu minggu terdiri dari 7 hari: Senin sampai Minggu." },
    { q: "Manakah bangun datar yang bentuknya bulat sempurna?", o: ["Persegi", "Segitiga", "Lingkaran", "Persegi Panjang"], c: 2, e: "Lingkaran adalah bangun datar yang bentuknya bulat sempurna." },
    { q: "Hasil dari 3 + 3 + 3 adalah...", o: ["6", "8", "9", "12"], c: 2, e: "3 ditambah 3 ditambah 3 sama dengan 9." },
    { q: "Andi punya 5 kelereng merah dan 4 kelereng biru. Berapa jumlah kelereng Andi?", o: ["8", "9", "10", "11"], c: 1, e: "5 ditambah 4 sama dengan 9." },
    { q: "Angka sesudah 15 adalah...", o: ["14", "16", "17", "18"], c: 1, e: "Angka setelah 15 adalah 16." },
    { q: "Doni punya 8 cokelat. Dia membagikan 3 cokelat kepada temannya. Sisa cokelat Doni adalah...", o: ["3", "4", "5", "6"], c: 2, e: "8 dikurangi 3 sama dengan 5." },
    { q: "Berapa banyak jari di kedua tangan kita?", o: ["5", "8", "10", "12"], c: 2, e: "Satu tangan ada 5 jari, dua tangan berarti 10 jari." },
    { q: "Urutan angka dari yang terkecil: 8, 5, 2, 9. Yang paling kecil adalah...", o: ["2", "5", "8", "9"], c: 0, e: "Angka 2 adalah yang terkecil di antara pilihan tersebut." },
    { q: "Berapa hasil dari 7 + 7?", o: ["12", "13", "14", "15"], c: 2, e: "7 ditambah 7 sama dengan 14." },
    { q: "Jika kemarin hari Senin, besok hari apa?", o: ["Selasa", "Rabu", "Kamis", "Jumat"], c: 1, e: "Kemarin Senin, berarti hari ini Selasa. Besok adalah hari Rabu." },
    { q: "Manakah benda yang bentuknya seperti tabung?", o: ["Bola", "Buku", "Kaleng susu", "Topi ulang tahun"], c: 2, e: "Kaleng susu memiliki bentuk tabung." },
    { q: "Berapa hasil dari 20 - 10?", o: ["5", "10", "15", "20"], c: 1, e: "20 dikurangi 10 sama dengan 10." }
  ],
  "Agama Islam": [
    // 20 Questions for Agama Islam Modul 1
    { q: "Siapakah nama nabi terakhir dalam agama Islam?", o: ["Nabi Isa AS", "Nabi Musa AS", "Nabi Muhammad SAW", "Nabi Ibrahim AS"], c: 2, e: "Nabi Muhammad SAW adalah penutup para nabi dan rasul." },
    { q: "Rukun Islam yang pertama adalah...", o: ["Shalat", "Zakat", "Puasa", "Syahadat"], c: 3, e: "Membaca dua kalimat syahadat adalah rukun Islam yang pertama." },
    { q: "Kitab suci agama Islam yang diturunkan kepada Nabi Muhammad SAW adalah...", o: ["Taurat", "Zabur", "Injil", "Al-Qur'an"], c: 3, e: "Al-Qur'an diturunkan kepada Nabi Muhammad melalui perantara Malaikat Jibril." },
    { q: "Shalat wajib sehari semalam berjumlah berapa waktu?", o: ["3 Waktu", "4 Waktu", "5 Waktu", "6 Waktu"], c: 2, e: "Shalat fardhu terdiri dari Subuh, Dzuhur, Ashar, Maghrib, dan Isya." },
    { q: "Dimanakah arah kiblat umat Islam saat melaksanakan shalat?", o: ["Masjidil Aqsa", "Ka'bah di Mekkah", "Masjid Nabawi", "Gua Hira"], c: 1, e: "Ka'bah di kota Mekkah adalah kiblat shalat bagi seluruh umat Islam." },
    { q: "Malaikat yang bertugas menyampaikan wahyu adalah malaikat...", o: ["Mikail", "Jibril", "Israfil", "Izrail"], c: 1, e: "Malaikat Jibril adalah malaikat yang bertugas menyampaikan wahyu kepada para rasul." },
    { q: "Bulan di mana umat Islam diwajibkan berpuasa sebulan penuh adalah bulan...", o: ["Muharram", "Syawal", "Ramadhan", "Zulhijjah"], c: 2, e: "Puasa Ramadhan adalah kewajiban bagi setiap muslim yang mampu." },
    { q: "Siapakah nama ayah Nabi Muhammad SAW?", o: ["Abu Muthalib", "Abu Thalib", "Abdullah", "Hamzah"], c: 2, e: "Nama ayah kandung Nabi Muhammad SAW adalah Abdullah." },
    { q: "Berapa jumlah rakaat shalat Subuh?", o: ["2 Rakaat", "3 Rakaat", "4 Rakaat", "5 Rakaat"], c: 0, e: "Shalat Subuh terdiri dari 2 rakaat." },
    { q: "Kalimat 'Bismillahir-rahmanir-rahim' disebut dengan bacaan...", o: ["Takbir", "Tahmid", "Tasbih", "Basmalah"], c: 3, e: "Bacaan tersebut disebut Basmalah." },
    { q: "Siapakah nabi pertama yang diciptakan Allah?", o: ["Nabi Nuh AS", "Nabi Adam AS", "Nabi Ibrahim AS", "Nabi Muhammad SAW"], c: 1, e: "Nabi Adam AS adalah manusia pertama dan nabi pertama yang diciptakan Allah." },
    { q: "Sebelum melaksanakan shalat, kita wajib mensucikan diri dengan cara...", o: ["Mandi biasa", "Wudhu", "Mencuci tangan saja", "Menyikat gigi"], c: 1, e: "Wudhu adalah syarat sah sebelum melaksanakan shalat." },
    { q: "Tempat ibadah umat Islam disebut...", o: ["Gereja", "Vihara", "Pura", "Masjid"], c: 3, e: "Masjid adalah tempat ibadah khusus umat Islam." },
    { q: "Jumlah rukun iman ada berapa?", o: ["4", "5", "6", "7"], c: 2, e: "Rukun Iman ada 6 perkara." },
    { q: "Ibadah haji dilakukan di kota...", o: ["Madinah", "Mekkah", "Yerusalem", "Mesir"], c: 1, e: "Ibadah haji berpusat di kota Mekkah, Arab Saudi." },
    { q: "Siapakah nama ibunda Nabi Muhammad SAW?", o: ["Fatimah", "Khadijah", "Aminah", "Aisyah"], c: 2, e: "Aminah adalah nama ibu kandung Nabi Muhammad SAW." },
    { q: "Berapa jumlah rakaat shalat Maghrib?", o: ["2 Rakaat", "3 Rakaat", "4 Rakaat", "5 Rakaat"], c: 1, e: "Shalat Maghrib terdiri dari 3 rakaat." },
    { q: "Berbuat baik kepada orang tua disebut dengan...", o: ["Birrul Walidain", "Riya", "Syirik", "Sombong"], c: 0, e: "Birrul Walidain berarti berbakti dan berbuat baik kepada kedua orang tua." },
    { q: "Hari raya umat Islam setelah selesai puasa Ramadhan adalah...", o: ["Idul Adha", "Idul Fitri", "Tahun Baru Islam", "Maulid Nabi"], c: 1, e: "Idul Fitri dirayakan pada tanggal 1 Syawal." },
    { q: "Malaikat peniup sangkakala di hari kiamat adalah malaikat...", o: ["Jibril", "Mikail", "Israfil", "Ridwan"], c: 2, e: "Malaikat Israfil bertugas meniup sangkakala saat hari kiamat tiba." }
  ]
};

async function updateAllModulesWithRealQuestions() {
  console.log("Replacing dummy questions with 20 real questions...");
  for (const [subjectName, qs] of Object.entries(realQuestions)) {
    const subject = await prisma.subject.findUnique({ where: { slug: subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") } });
    if (!subject) continue;
    
    // We update Modul 1
    const module1 = await prisma.module.findFirst({
      where: { subjectId: subject.id, title: { contains: "Modul 1" } }
    });
    if (!module1) continue;

    // Delete existing dummy questions for Modul 1
    await prisma.question.deleteMany({ where: { moduleId: module1.id } });

    // Create 20 real questions
    const data = qs.map(q => ({
      moduleId: module1.id,
      questionText: q.q,
      options: JSON.stringify(q.o),
      correctIndex: q.c,
      explanation: q.e
    }));

    await prisma.question.createMany({ data });
    console.log(`Updated 20 real questions for ${subjectName} Modul 1`);
  }
  console.log("Done!");
}

updateAllModulesWithRealQuestions().catch(console.error).finally(() => process.exit(0));
