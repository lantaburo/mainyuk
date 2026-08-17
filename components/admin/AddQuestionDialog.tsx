"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlusCircle, Loader2, CheckCircle2, XCircle, X, HelpCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuestion } from "@/app/admin/curriculum/actions";
import { useRouter } from "next/navigation";

const OPTION_LABELS = ["A", "B", "C", "D"];

type Props = {
  moduleId: string;
  moduleTitle: string;
};

export function AddQuestionDialog({ moduleId, moduleTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [explanation, setExplanation] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleClose = () => {
    setOpen(false);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
    setDifficultyLevel(1);
    setExplanation("");
    setResult(null);
  };

  const handleSubmit = () => {
    if (correctIndex === null) {
      setResult({ ok: false, message: "Pilih jawaban yang benar terlebih dahulu." });
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await createQuestion({
        moduleId,
        questionText,
        options,
        correctIndex,
        difficultyLevel,
        explanation,
      });
      if (res.ok) {
        setResult({ ok: true, message: "Soal berhasil ditambahkan!" });
        // Reset form for next question
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectIndex(null);
        setDifficultyLevel(1);
        setExplanation("");
        setTimeout(() => {
          setResult(null);
          router.refresh();
        }, 2000); // Tahan pesan sukses sebentar sebelum hilang
      } else {
        setResult({ ok: false, message: res.error || "Gagal menyimpan soal." });
      }
    });
  };

  const isValid =
    questionText.trim() &&
    options.every((o) => o.trim()) &&
    correctIndex !== null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tambah Soal
      </Button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-6">
          <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200">
            {/* Header (Fixed) */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900">Tambah Soal</h2>
                  <p className="text-xs text-gray-400">Buat soal baru secara manual</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Question text */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">Pertanyaan</Label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Tulis pertanyaan di sini..."
                  rows={3}
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">
                  Pilihan Jawaban{" "}
                  <span className="text-xs font-normal text-gray-400">— klik lingkaran untuk tandai jawaban benar</span>
                </Label>
                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {/* Correct answer selector */}
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(idx)}
                        title={`Tandai ${OPTION_LABELS[idx]} sebagai jawaban benar`}
                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                          correctIndex === idx
                            ? "bg-emerald-500 border-emerald-500 text-white scale-110"
                            : "border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-500"
                        }`}
                      >
                        {correctIndex === idx ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          OPTION_LABELS[idx]
                        )}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Opsi ${OPTION_LABELS[idx]}`}
                        className={`rounded-xl flex-1 ${correctIndex === idx ? "border-emerald-300 bg-emerald-50/50 focus-visible:ring-emerald-400" : ""}`}
                      />
                    </div>
                  ))}
                </div>
                {correctIndex !== null && (
                  <p className="text-xs text-emerald-600 font-medium pl-1">
                    ✓ Jawaban benar: Opsi {OPTION_LABELS[correctIndex]}
                  </p>
                )}
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Tingkat Kesulitan</Label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficultyLevel(lvl)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        difficultyLevel === lvl
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Level {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700">
                  Penjelasan{" "}
                  <span className="text-xs font-normal text-gray-400">(opsional)</span>
                </Label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Penjelasan mengapa jawaban tersebut benar..."
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>

            {/* Footer (Fixed) */}
            <div className="shrink-0 p-5 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
              {result && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${result.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}>
                  {result.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  {result.message}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl py-6 bg-white"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-6"
                  onClick={handleSubmit}
                  disabled={isPending || !isValid}
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyimpan...</>
                  ) : (
                    "Simpan Soal"
                  )}
                </Button>
              </div>
              <p className="text-center text-xs text-gray-400">
                Setelah menyimpan, form akan direset agar kamu bisa langsung tambah soal berikutnya.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
