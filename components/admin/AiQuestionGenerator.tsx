"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateQuestionsForModule } from "@/app/admin/curriculum/actions";

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];

type Props = {
  moduleId: string;
  moduleTitle: string;
  subjectName: string;
  gradeLevel: number;
};

export function AiQuestionGenerator({ moduleId, moduleTitle, subjectName, gradeLevel }: Props) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(10);
  const [targetLevel, setTargetLevel] = useState<number | "all">("all");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setResult(null);
    startTransition(async () => {
      const res = await generateQuestionsForModule(moduleId, count, targetLevel);
      if (res.ok) {
        setResult({ ok: true, message: `✨ Berhasil! ${res.count} soal baru telah ditambahkan ke modul ini.` });
      } else {
        setResult({ ok: false, message: res.error || "Terjadi kesalahan." });
      }
    });
  };

  return (
    <div className="rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 backdrop-blur-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-indigo-900">Generate Soal dengan AI</h3>
            <p className="text-sm text-indigo-600">Buat soal secara otomatis untuk: <span className="font-semibold">{moduleTitle}</span> — Kelas {gradeLevel} {subjectName}</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-indigo-400" /> : <ChevronDown className="h-5 w-5 text-indigo-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5">
          <div className="h-px bg-indigo-200/60" />

          <div>
            <label className="block text-sm font-bold text-indigo-800 mb-3">Jumlah Soal yang Digenerate</label>
            <div className="flex gap-2 flex-wrap">
              {QUESTION_COUNT_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${count === n
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-300'
                    : 'bg-white border border-indigo-200 text-indigo-700 hover:border-indigo-400'
                  }`}
                >
                  {n} soal
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-indigo-800 mb-3">Target Level (Tingkat Kesulitan)</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTargetLevel("all")}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${targetLevel === "all"
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-300'
                  : 'bg-white border border-indigo-200 text-indigo-700 hover:border-indigo-400'
                }`}
              >
                Semua Level (Otomatis)
              </button>
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setTargetLevel(lvl)}
                  className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${targetLevel === lvl
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-300'
                    : 'bg-white border border-indigo-200 text-indigo-700 hover:border-indigo-400'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>
            <p className="text-xs text-indigo-500 mt-2">
              {targetLevel === "all" 
                ? "AI akan membuat soal dan membaginya rata ke Level 1 hingga 5."
                : `AI hanya akan membuat soal khusus untuk Level ${targetLevel}.`}
            </p>
          </div>

          {result && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${result.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {result.ok ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-500/30 text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI sedang membuat soal...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate {count} Soal Sekarang
              </>
            )}
          </Button>

          <p className="text-xs text-indigo-400 text-center">
            AI akan membuat soal berdasarkan mata pelajaran, tingkat kelas, dan judul modul yang tersimpan di database.
          </p>
        </div>
      )}
    </div>
  );
}
