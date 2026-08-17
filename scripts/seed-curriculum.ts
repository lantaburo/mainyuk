import { prisma } from "../lib/prisma";

const SUBJECTS = [
  { name: "Matematika", slug: "matematika", icon: "calculator", color: "#3b82f6" },
  { name: "Sains", slug: "sains", icon: "flask-conical", color: "#10b981" },
  { name: "Geografi", slug: "geografi", icon: "globe", color: "#f59e0b" },
  { name: "Bahasa Indonesia", slug: "bahasa-indonesia", icon: "book", color: "#ef4444" },
  { name: "Bahasa Arab", slug: "bahasa-arab", icon: "languages", color: "#8b5cf6" },
  { name: "Tsaqofah", slug: "tsaqofah", icon: "book-open", color: "#06b6d4" },
];

function generateQuestions(subjectSlug: string, gradeLevel: number, moduleIndex: number) {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    let qText = "";
    let options: string[] = [];
    let correct = 0;
    let explanation = "";

    // Generate specific realistic question based on subject
    if (subjectSlug === "matematika") {
      const a = Math.floor(Math.random() * (10 * gradeLevel)) + 1;
      const b = Math.floor(Math.random() * (10 * gradeLevel)) + 1;
      const ans = a + b;
      qText = `Berapakah hasil dari ${a} + ${b}?`;
      options = [ans.toString(), (ans + 1).toString(), (ans - 1).toString(), (ans + 2).toString()];
      explanation = `Hasil dari penjumlahan ${a} dan ${b} adalah ${ans}.`;
    } else if (subjectSlug === "sains") {
      const sainsQuestions = [
        { q: "Hewan apakah yang menghasilkan madu?", a: "Lebah", o: ["Semut", "Lalat", "Kupu-kupu"] },
        { q: "Apa nama planet yang kita tinggali?", a: "Bumi", o: ["Mars", "Venus", "Jupiter"] },
        { q: "Air yang membeku akan menjadi...", a: "Es", o: ["Uap", "Hujan", "Awan"] },
        { q: "Bagian tumbuhan yang menyerap air adalah...", a: "Akar", o: ["Daun", "Batang", "Bunga"] },
        { q: "Hewan yang berkaki empat adalah...", a: "Sapi", o: ["Ayam", "Burung", "Ular"] },
        { q: "Ikan bernapas menggunakan...", a: "Insang", o: ["Paru-paru", "Kulit", "Hidung"] },
        { q: "Matahari terbit di sebelah...", a: "Timur", o: ["Barat", "Selatan", "Utara"] },
        { q: "Benda yang bersinar di malam hari adalah...", a: "Bulan", o: ["Matahari", "Awan", "Pelangi"] },
        { q: "Hewan yang memiliki belalai adalah...", a: "Gajah", o: ["Jerapah", "Singa", "Harimau"] },
        { q: "Rasa air laut adalah...", a: "Asin", o: ["Manis", "Pahit", "Asam"] }
      ];
      const sq = sainsQuestions[i % sainsQuestions.length];
      qText = sq.q;
      options = [sq.a, ...sq.o];
      explanation = `Jawaban yang tepat adalah ${sq.a}.`;
    } else if (subjectSlug === "geografi") {
      const geoQuestions = [
        { q: "Ibukota negara Indonesia adalah...", a: "Jakarta", o: ["Surabaya", "Bandung", "Medan"] },
        { q: "Benua terbesar di dunia adalah...", a: "Asia", o: ["Afrika", "Eropa", "Amerika"] },
        { q: "Negara yang dijuluki Negeri Sakura adalah...", a: "Jepang", o: ["Korea", "Cina", "Thailand"] },
        { q: "Candi Borobudur terletak di provinsi...", a: "Jawa Tengah", o: ["Jawa Timur", "Jawa Barat", "Bali"] },
        { q: "Pulau Dewata adalah sebutan untuk pulau...", a: "Bali", o: ["Lombok", "Jawa", "Sumatera"] },
        { q: "Gunung tertinggi di dunia adalah...", a: "Gunung Everest", o: ["Gunung Semeru", "Gunung Rinjani", "Gunung Krakatau"] },
        { q: "Lautan terluas di dunia adalah...", a: "Samudera Pasifik", o: ["Samudera Hindia", "Samudera Atlantik", "Samudera Arktik"] },
        { q: "Negara tetangga terdekat di selatan Indonesia adalah...", a: "Australia", o: ["Singapura", "Malaysia", "Filipina"] },
        { q: "Provinsi paling barat di Indonesia adalah...", a: "Aceh", o: ["Papua", "Jakarta", "Bali"] },
        { q: "Ibukota provinsi Jawa Barat adalah...", a: "Bandung", o: ["Semarang", "Surabaya", "Yogyakarta"] }
      ];
      const gq = geoQuestions[i % geoQuestions.length];
      qText = gq.q;
      options = [gq.a, ...gq.o];
      explanation = `Jawaban yang tepat adalah ${gq.a}.`;
    } else if (subjectSlug === "bahasa-indonesia") {
      const biQuestions = [
        { q: "Kata dasar dari 'berjalan' adalah...", a: "Jalan", o: ["Lari", "Maju", "Gerak"] },
        { q: "Antonim dari kata 'tinggi' adalah...", a: "Rendah", o: ["Kecil", "Pendek", "Besar"] },
        { q: "Sinonim dari kata 'pintar' adalah...", a: "Pandai", o: ["Bodoh", "Malas", "Kuat"] },
        { q: "Kalimat tanya selalu diakhiri dengan tanda...", a: "Tanya (?)", o: ["Seru (!)", "Titik (.)", "Koma (,)"] },
        { q: "Orang yang menjalankan kereta api disebut...", a: "Masinis", o: ["Pilot", "Nahkoda", "Sopir"] },
        { q: "Hewan yang mengeong adalah...", a: "Kucing", o: ["Anjing", "Ayam", "Kambing"] },
        { q: "Ibu memasak di...", a: "Dapur", o: ["Kamar tidur", "Kamar mandi", "Ruang tamu"] },
        { q: "Ayah membaca koran di pagi...", a: "Hari", o: ["Malam", "Sore", "Siang"] },
        { q: "Buah yang berwarna kuning dan bentuknya panjang adalah...", a: "Pisang", o: ["Jeruk", "Apel", "Anggur"] },
        { q: "Tempat meminjam buku di sekolah adalah...", a: "Perpustakaan", o: ["Kantin", "UKS", "Laboratorium"] }
      ];
      const biq = biQuestions[i % biQuestions.length];
      qText = biq.q;
      options = [biq.a, ...biq.o];
      explanation = `Jawaban yang tepat adalah ${biq.a}.`;
    } else if (subjectSlug === "bahasa-arab") {
      const baQuestions = [
        { q: "Apa bahasa Arabnya 'buku'?", a: "كِتَابٌ (Kitabun)", o: ["قَلَمٌ (Qalamun)", "بَابٌ (Babun)", "مَكْتَبٌ (Maktabun)"] },
        { q: "Apa arti dari 'مَدْرَسَةٌ' (Madrasatun)?", a: "Sekolah", o: ["Rumah", "Pasar", "Masjid"] },
        { q: "Apa bahasa Arabnya 'ayah'?", a: "أَبٌ (Abun)", o: ["أُمٌّ (Ummun)", "أَخٌ (Akhun)", "أُخْتٌ (Ukhtun)"] },
        { q: "Angka 'wahidun' (وَاحِدٌ) artinya...", a: "Satu", o: ["Dua", "Tiga", "Empat"] },
        { q: "Apa bahasa Arabnya 'pintu'?", a: "بَابٌ (Babun)", o: ["نَافِذَةٌ (Nafidzatun)", "جِدَارٌ (Jidarun)", "سَقْفٌ (Saqfun)"] },
        { q: "Apa arti dari 'قَلَمٌ' (Qalamun)?", a: "Pena/Pensil", o: ["Buku", "Meja", "Kursi"] },
        { q: "Apa bahasa Arabnya 'masjid'?", a: "مَسْجِدٌ (Masjidun)", o: ["بَيْتٌ (Baitun)", "حَدِيقَةٌ (Hadiqotun)", "سُوقٌ (Suqun)"] },
        { q: "Angka 'itsnani' (اِثْنَانِ) artinya...", a: "Dua", o: ["Satu", "Tiga", "Empat"] },
        { q: "Apa arti dari 'كُرْسِيٌّ' (Kursiyyun)?", a: "Kursi", o: ["Meja", "Papan Tulis", "Lemari"] },
        { q: "Apa bahasa Arabnya 'guru (laki-laki)'?", a: "مُدَرِّسٌ (Mudarrisun)", o: ["طَالِبٌ (Thalibun)", "طَبِيبٌ (Thabibun)", "مُهَنْدِسٌ (Muhandisun)"] }
      ];
      const baq = baQuestions[i % baQuestions.length];
      qText = baq.q;
      options = [baq.a, ...baq.o];
      explanation = `Jawaban yang tepat adalah ${baq.a}.`;
    } else if (subjectSlug === "tsaqofah") {
      const tsqQuestions = [
        { q: "Nabi terakhir yang diutus oleh Allah SWT adalah...", a: "Nabi Muhammad SAW", o: ["Nabi Musa AS", "Nabi Isa AS", "Nabi Ibrahim AS"] },
        { q: "Kitab suci umat Islam adalah...", a: "Al-Qur'an", o: ["Taurat", "Zabur", "Injil"] },
        { q: "Shalat fardhu sehari semalam berjumlah... waktu", a: "Lima", o: ["Tiga", "Empat", "Enam"] },
        { q: "Puasa wajib umat Islam dilaksanakan pada bulan...", a: "Ramadhan", o: ["Syawal", "Rajab", "Muharram"] },
        { q: "Ibadah haji dilaksanakan di kota...", a: "Makkah", o: ["Madinah", "Yerusalem", "Kairo"] },
        { q: "Malaikat yang bertugas menyampaikan wahyu adalah...", a: "Malaikat Jibril", o: ["Malaikat Mikail", "Malaikat Israfil", "Malaikat Izrail"] },
        { q: "Rukun Islam yang pertama adalah...", a: "Syahadat", o: ["Shalat", "Zakat", "Puasa"] },
        { q: "Surah pertama dalam Al-Qur'an adalah...", a: "Al-Fatihah", o: ["Al-Baqarah", "Yasin", "Al-Ikhlas"] },
        { q: "Khalifah pertama setelah Rasulullah wafat adalah...", a: "Abu Bakar As-Siddiq", o: ["Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"] },
        { q: "Sifat wajib Allah yang berarti 'Maha Mengetahui' adalah...", a: "'Alim", o: ["Qadir", "Sami'", "Bashir"] }
      ];
      const tsq = tsqQuestions[i % tsqQuestions.length];
      qText = tsq.q;
      options = [tsq.a, ...tsq.o];
      explanation = `Jawaban yang tepat adalah ${tsq.a}.`;
    }

    // Ensure options array doesn't have duplicates for math
    if (subjectSlug === "matematika") {
      options = Array.from(new Set(options));
      while(options.length < 4) {
        options.push((parseInt(options[0]) + Math.floor(Math.random() * 5) + 3).toString());
      }
    }

    const correctAns = options[0];
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctAns);

    questions.push({
      questionText: qText,
      options: shuffled,
      correctIndex,
      difficultyLevel: 1, // All level 1
      explanation,
    });
  }
  return questions;
}

async function main() {
  console.log("Starting curriculum seed...");
  
  for (const sub of SUBJECTS) {
    let subject = await prisma.subject.findUnique({ where: { slug: sub.slug } });
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          icon: sub.icon,
          color: sub.color,
        }
      });
      console.log(`Created subject: ${sub.name}`);
    }

    // For each grade 1 to 6
    for (let grade = 1; grade <= 6; grade++) {
      // 5 modules per grade
      for (let m = 1; m <= 5; m++) {
        const title = `Modul ${m} ${sub.name} Kelas ${grade}`;
        const slug = `${sub.slug}-k${grade}-m${m}`;

        let module = await prisma.module.findFirst({
          where: { subjectId: subject.id, slug: slug }
        });

        if (!module) {
          module = await prisma.module.create({
            data: {
              subjectId: subject.id,
              gradeLevel: grade,
              title: title,
              slug: slug,
              description: `Materi dasar dan latihan soal untuk ${sub.name} Kelas ${grade} Modul ${m}.`,
              isPublished: true,
              isPremium: false,
            }
          });
        }

        // Check if questions exist
        const questionCount = await prisma.question.count({
          where: { moduleId: module.id }
        });

        if (questionCount === 0) {
          const generatedQuestions = generateQuestions(sub.slug, grade, m);
          await prisma.question.createMany({
            data: generatedQuestions.map(q => ({
              moduleId: module!.id,
              questionText: q.questionText,
              options: q.options,
              correctIndex: q.correctIndex,
              difficultyLevel: q.difficultyLevel,
              explanation: q.explanation,
            }))
          });
          console.log(`Generated 10 questions for ${title}`);
        }
      }
    }
  }

  console.log("Curriculum seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
