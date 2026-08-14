"use client";

import { useState } from "react";
import { generateQuizModule } from "@/app/actions/generate-quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function QuizGeneratorPage() {
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("1");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ok: boolean, error?: string, slug?: string} | null>(null);

  // Function to get required question count based on grade
  const getQuestionCountForGrade = (gradeStr: string) => {
    const g = parseInt(gradeStr);
    if (g === 1 || g === 2) return 10;
    if (g === 3) return 15;
    if (g === 4 || g === 5) return 20;
    if (g === 6) return 25;
    return 10;
  };

  const currentCount = getQuestionCountForGrade(grade);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !title) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await generateQuizModule(subject, parseInt(grade), title, currentCount);
      setResult(res as any);
    } catch (err: any) {
      setResult({ ok: false, error: err.message });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Quiz Generator</h1>
        <p className="mt-2 text-slate-500">
          Buat modul kuis secara instan menggunakan AI. Sistem otomatis menentukan jumlah soal sesuai tingkat kelas.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="font-semibold">Mata Pelajaran</Label>
              <Input 
                id="subject" 
                placeholder="mis. Matematika, IPA, Sejarah" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade" className="font-semibold">Tingkat Kelas (SD)</Label>
              <Select value={grade} onValueChange={(val) => setGrade(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(g => (
                    <SelectItem key={g} value={g.toString()}>Kelas {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Topik / Judul Modul</Label>
            <Input 
              id="title" 
              placeholder="mis. Penjumlahan Bilangan Bulat" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <Label className="font-semibold text-slate-700">Ketentuan Modul</Label>
            <p className="text-sm text-slate-600 mt-1">
              Berdasarkan kurikulum, untuk Kelas {grade}, modul ini akan di-generate dengan <strong>{currentCount} Soal</strong>.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI Sedang Berpikir... (Bisa butuh 10-30 detik)
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Kuis Sekarang
              </>
            )}
          </Button>
        </form>
      </div>

      {result && (
        <div className={`p-6 rounded-2xl border ${result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          {result.ok ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div>
                <h3 className="font-bold text-xl">Berhasil!</h3>
                <p className="mt-1">Modul kuis berhasil dibuat dan disimpan ke database.</p>
              </div>
              <Link href={`/quiz-demo`} className="inline-block mt-4 bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700">
                Lihat di Halaman Demo
              </Link>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
              <div>
                <h3 className="font-bold">Gagal Generate Kuis</h3>
                <p className="mt-1 text-sm opacity-90">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
