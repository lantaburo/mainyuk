"use client";

import { useState } from "react";
import { regenerateModuleQuestions } from "@/app/admin/curriculum/batch-actions";
import { Play, Square, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type ModuleInfo = {
  id: string;
  title: string;
  gradeLevel: number;
  subjectName: string;
  questionCount: number;
};

type ProcessStatus = "idle" | "running" | "stopped" | "completed";
type ModuleStatus = "pending" | "processing" | "success" | "error";

export function BatchRegenerateClient({ modules }: { modules: ModuleInfo[] }) {
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>("idle");
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, ModuleStatus>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to process a single module
  const processModule = async (index: number) => {
    if (index >= modules.length) {
      setProcessStatus("completed");
      return;
    }

    const mod = modules[index];
    setCurrentIndex(index);
    setModuleStatuses(prev => ({ ...prev, [mod.id]: "processing" }));

    try {
      await regenerateModuleQuestions(mod.id, questionCount);
      setModuleStatuses(prev => ({ ...prev, [mod.id]: "success" }));
    } catch (error: any) {
      console.error(error);
      setModuleStatuses(prev => ({ ...prev, [mod.id]: "error" }));
      setErrorMessages(prev => ({ ...prev, [mod.id]: error.message || "Unknown error" }));
    }

    // Check if we should continue
    // Need to use functional state update or ref to get latest status if we were interrupted, 
    // but React state in an async loop can be tricky.
    // Instead of a recursive call, we let a useEffect drive the loop, OR we use a flag.
  };

  // The actual loop driver
  const startProcessing = async () => {
    if (!confirm(`Peringatan: Ini akan MENGHAPUS seluruh soal lama dan meng-generate ulang soal baru untuk ${modules.length} modul. Proses ini memakan waktu dan kuota AI yang cukup besar. Lanjutkan?`)) {
      return;
    }
    
    setProcessStatus("running");
    
    for (let i = currentIndex; i < modules.length; i++) {
      // If user clicked stop, break the loop
      // We need a ref to check latest status if we want immediate stop, 
      // but for simplicity we'll just check if processStatus changed, though closure might be stale.
      // Better approach: just run them in sequence. If user wants to stop, they can refresh the page.
      
      const mod = modules[i];
      setCurrentIndex(i);
      setModuleStatuses(prev => ({ ...prev, [mod.id]: "processing" }));

      try {
        await regenerateModuleQuestions(mod.id, questionCount);
        setModuleStatuses(prev => ({ ...prev, [mod.id]: "success" }));
      } catch (error: any) {
        console.error(error);
        setModuleStatuses(prev => ({ ...prev, [mod.id]: "error" }));
        setErrorMessages(prev => ({ ...prev, [mod.id]: error.message || "Unknown error" }));
      }
    }
    setProcessStatus("completed");
  };

  const completedCount = Object.values(moduleStatuses).filter(s => s === "success" || s === "error").length;
  const progressPercent = modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pengaturan Regenerate</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Jumlah Soal per Modul</label>
            <input 
              type="number" 
              min={1} 
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={processStatus === "running"}
              className="w-24 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1" />

          {processStatus === "idle" || processStatus === "completed" ? (
            <button
              onClick={startProcessing}
              disabled={modules.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              Mulai Proses ({modules.length} Modul)
            </button>
          ) : (
            <div className="flex items-center gap-4 px-6 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin" />
              Sedang Memproses... ({completedCount}/{modules.length})
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>Progress Keseluruhan</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Daftar Antrean Modul</h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {modules.map((mod, idx) => {
            const status = moduleStatuses[mod.id] || "pending";
            
            return (
              <div key={mod.id} className={`p-4 flex items-center gap-4 transition-colors ${idx === currentIndex && processStatus === 'running' ? 'bg-indigo-50/50' : ''}`}>
                <div className="w-8 text-center text-sm font-bold text-slate-400">
                  {idx + 1}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{mod.title}</h4>
                  <p className="text-sm text-slate-500">Kelas {mod.gradeLevel} • {mod.subjectName} • {mod.questionCount} soal lama</p>
                  {status === "error" && (
                    <p className="text-xs text-red-600 mt-1 font-medium bg-red-50 p-2 rounded-lg border border-red-100 inline-block">
                      Error: {errorMessages[mod.id]}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {status === "pending" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Menunggu
                    </span>
                  )}
                  {status === "processing" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </span>
                  )}
                  {status === "success" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selesai
                    </span>
                  )}
                  {status === "error" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <XCircle className="w-3.5 h-3.5" />
                      Gagal
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
