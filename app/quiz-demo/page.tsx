"use client";

import QuizPlayer, { QuizQuestion } from "@/components/quiz/QuizPlayer";

const sampleQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Berapakah hasil dari 5 + 3?",
    options: ["6", "7", "8", "9"],
    correctIndex: 2,
    explanation: "5 ditambah 3 sama dengan 8. Coba hitung menggunakan jarimu: lima jari ditambah tiga jari."
  },
  {
    id: 2,
    question: "Hewan apakah yang menghasilkan madu?",
    options: ["Semut", "Lebah", "Burung", "Katak"],
    correctIndex: 1,
    explanation: "Lebah mengumpulkan nektar dari bunga dan mengubahnya menjadi madu di sarang mereka."
  },
  {
    id: 3,
    question: "Planet manakah yang kita tinggali saat ini?",
    options: ["Mars", "Bulan", "Bumi", "Venus"],
    correctIndex: 2,
    explanation: "Kita tinggal di planet Bumi, yang merupakan satu-satunya planet yang diketahui memiliki kehidupan."
  }
];

export default function QuizDemoPage() {
  return (
    <div className="min-h-screen bg-slate-100 relative overflow-hidden py-12 px-4 md:px-8">
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4 drop-shadow-sm">
            Demo Kuis Anak
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto">
            Ini adalah pratinjau komponen kuis interaktif dengan gamifikasi yang dirancang khusus untuk siswa SD.
          </p>
        </div>

        <div className="w-full">
          <QuizPlayer 
            title="Pengetahuan Umum Kelas 1" 
            questions={sampleQuestions} 
          />
        </div>
      </div>
    </div>
  );
}
