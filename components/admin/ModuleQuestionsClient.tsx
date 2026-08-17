"use client";

import { useState } from "react";
import { HelpCircle, Trash2, Loader2, CheckSquare } from "lucide-react";
import { EditQuestionDialog } from "@/components/admin/EditQuestionDialog";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";
import { deleteBulkQuestions } from "@/app/admin/curriculum/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ModuleQuestionsClient({ questions }: { questions: any[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const questionsByLevel = [1, 2, 3, 4, 5].map((level) => ({
    level,
    questions: questions.filter((q) => q.difficultyLevel === level),
  }));

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.size} soal terpilih? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteBulkQuestions(Array.from(selectedIds));
    setIsDeleting(false);

    if (result.ok) {
      toast.success(`${selectedIds.size} soal berhasil dihapus`);
      setSelectedIds(new Set());
      router.refresh();
    } else {
      toast.error(result.error || "Gagal menghapus soal");
    }
  };

  if (questions.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center bg-white/40 border border-white/60 rounded-3xl shadow-sm backdrop-blur-xl">
        <HelpCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Belum ada soal</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Gunakan AI Generator di atas untuk membuat soal secara otomatis, atau tambahkan soal secara manual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Floating Action Bar untuk Bulk Delete */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 mb-6 flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-2xl shadow-lg backdrop-blur-xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
              {selectedIds.size}
            </div>
            <span className="font-semibold text-red-900">Soal Terpilih</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              disabled={isDeleting}
            >
              Batal
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus Massal
            </button>
          </div>
        </div>
      )}

      {/* Select All Toggle */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <div className={`flex items-center justify-center w-5 h-5 rounded border ${selectedIds.size === questions.length ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
            {selectedIds.size === questions.length && <CheckSquare className="w-4 h-4" />}
          </div>
          {selectedIds.size === questions.length ? "Batal Pilih Semua" : "Pilih Semua"}
        </button>
      </div>

      <div className="space-y-10">
        {questionsByLevel.map(
          ({ level, questions }) =>
            questions.length > 0 && (
              <div key={level} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-sm">
                    Level {level}
                  </div>
                  <span className="text-sm font-medium text-slate-500">{questions.length} soal</span>
                </div>
                {questions.map((q, idx) => {
                  const options = (typeof q.options === "string" ? JSON.parse(q.options) : q.options) as string[];
                  const isSelected = selectedIds.has(q.id);

                  return (
                    <div
                      key={q.id}
                      className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                        isSelected ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-500/20" : "border-white/50 bg-white/60"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-1">
                          <button
                            onClick={() => toggleSelection(q.id)}
                            className={`flex items-center justify-center w-6 h-6 rounded-md border ${
                              isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white hover:border-indigo-400"
                            } transition-colors`}
                          >
                            {isSelected && <CheckSquare className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <h3 className="font-bold text-lg text-slate-900">{q.questionText}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl border ${
                                  optIdx === q.correctIndex
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                    : "bg-white border-slate-200 text-slate-600"
                                }`}
                              >
                                <span className="font-medium text-sm">
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                </span>
                                {optIdx === q.correctIndex && (
                                  <span className="ml-2 text-xs font-bold text-emerald-600">✓ Benar</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <span className="font-semibold text-slate-600">Penjelasan: </span>
                              {q.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <EditQuestionDialog
                            questionId={q.id}
                            initialText={q.questionText}
                            initialOptions={options}
                            initialCorrectIndex={q.correctIndex}
                            initialDifficultyLevel={q.difficultyLevel}
                            initialExplanation={q.explanation}
                          />
                          <DeleteQuestionButton questionId={q.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        )}
      </div>
    </div>
  );
}
