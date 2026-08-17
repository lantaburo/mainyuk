"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function RaporAiAnalysis({ studentId }: { studentId: string }) {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setAnalysis("");
    setError("");

    try {
      const res = await fetch("/api/edu/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal menghubungi server");
      }

      if (!res.body) throw new Error("Tidak ada balasan dari server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setAnalysis((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple basic markdown parser for bolding
  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Replace **text** with <strong>text</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block mb-2">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 lg:p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950 flex items-center gap-2 mb-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            Analisis & Saran AI
          </h2>
          <p className="text-indigo-800/70 max-w-2xl">
            Dapatkan insight mendalam tentang perkembangan belajar anak Anda dan rekomendasi aktivitas dari asisten AI kami.
          </p>
        </div>

        {!analysis && !isLoading && (
          <Button 
            onClick={handleGenerate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Buat Analisis AI
          </Button>
        )}
      </div>

      {(isLoading || analysis || error) && (
        <div className="mt-8 bg-white rounded-2xl p-6 border border-indigo-100 shadow-inner relative">
          {error ? (
            <div className="text-red-500 font-medium">{error}</div>
          ) : (
            <div className="text-slate-700 leading-relaxed">
              {formatText(analysis)}
              {isLoading && (
                <span className="inline-flex items-center gap-1 mt-2 text-indigo-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
