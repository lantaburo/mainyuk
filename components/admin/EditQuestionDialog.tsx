"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, XCircle, X, HelpCircle, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateQuestion } from "@/app/admin/curriculum/actions";
import { useRouter } from "next/navigation";

const OPTION_LABELS = ["A", "B", "C", "D"];

type Props = {
  questionId: string;
  initialText: string;
  initialOptions: string[];
  initialCorrectIndex: number;
  initialDifficultyLevel: number;
  initialExplanation?: string | null;
};

export function EditQuestionDialog({ 
  questionId, 
  initialText, 
  initialOptions, 
  initialCorrectIndex, 
  initialDifficultyLevel, 
  initialExplanation 
}: Props) {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState(initialText);
  const [options, setOptions] = useState(initialOptions.length === 4 ? initialOptions : ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(initialCorrectIndex);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(initialDifficultyLevel);
  const [explanation, setExplanation] = useState(initialExplanation || "");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset to initial values when cancelled
    setQuestionText(initialText);
    setOptions(initialOptions.length === 4 ? initialOptions : ["", "", "", ""]);
    setCorrectIndex(initialCorrectIndex);
    setDifficultyLevel(initialDifficultyLevel);
    setExplanation(initialExplanation || "");
    setResult(null);
  };

  const handleSubmit = () => {
    if (correctIndex === null) {
      setResult({ ok: false, message: "Pilih jawaban yang benar terlebih dahulu." });
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await updateQuestion({
        questionId,
        questionText,
        options,
        correctIndex,
        difficultyLevel,
        explanation,
      });
      if (res.ok) {
        setResult({ ok: true, message: "Soal berhasil diperbarui!" });
        setTimeout(() => {
          setOpen(false);
          setResult(null);
          router.refresh();
        }, 1000);
      } else {
        setResult({ ok: false, message: res.error || "Gagal memperbarui soal." });
      }
    });
  };

  const isValid =
    questionText.trim() &&
    options.every((o) => o.trim()) &&
    correctIndex !== null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-amber-600 hover:bg-amber-100 rounded-full transition-colors bg-amber-50"
        title="Edit Soal"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto text-left">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Edit Soal</h2>
                <p className="text-xs text-gray-400 truncate max-w-xs">Perbarui data soal ini</p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Form */}
            <div className="space-y-5">
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
                            ? "bg-amber-500 border-amber-500 text-white scale-110"
                            : "border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-500"
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
                        className={`rounded-xl flex-1 ${correctIndex === idx ? "border-amber-300 bg-amber-50/50 focus-visible:ring-amber-400" : ""}`}
                      />
                    </div>
                  ))}
                </div>
                {correctIndex !== null && (
                  <p className="text-xs text-amber-600 font-medium pl-1">
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
                          ? "bg-amber-600 text-white shadow-md"
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

            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${result.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}>
                {result.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                {result.message}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={handleClose}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleSubmit}
                disabled={isPending || !isValid}
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
