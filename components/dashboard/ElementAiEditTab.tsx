"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { generateElementEditAction } from "@/lib/ai-actions";
import type { AiUsage } from "@/lib/ai-client";

/** Editor "AI" tab — instruct AI to rewrite just the selected element. */
export function ElementAiEditTab({
  storeId,
  currentOuterHtml,
  onApply,
}: {
  storeId: string;
  currentOuterHtml: string;
  onApply: (newOuterHtml: string) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [lastUsage, setLastUsage] = useState<AiUsage | null>(null);
  const [isPending, startTransition] = useTransition();

  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPending) {
      setProgress(0);
      let startTime = Date.now();
      const duration = 4000;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - ratio, 3); // ease-out
        setProgress(Math.round(eased * 95));
      }, 50);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(t);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPending]);

  function handleGenerate() {
    if (!instruction.trim()) return;
    startTransition(async () => {
      const res = await generateElementEditAction(storeId, currentOuterHtml, instruction);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onApply(res.html);
      setInstruction("");
      setLastUsage(res.usage);
      toast.success("Elemen berhasil diubah AI!");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        Edit elemen ini dengan AI
      </div>
      <Textarea
        rows={4}
        placeholder="Contoh: buat judulnya lebih besar dan warnanya biru"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        disabled={isPending}
        className="resize-none text-sm"
      />
      <Button onClick={handleGenerate} disabled={isPending || !instruction.trim()} size="sm" className="w-full">
        {isPending ? `Sedang mengubah... ${progress}%` : "Terapkan"}
      </Button>
      {isPending && <Progress value={progress} />}
      {lastUsage && !isPending && (
        <p className="text-center text-[11px] text-zinc-500">
          {lastUsage.totalTokens.toLocaleString("id-ID")} token terpakai
        </p>
      )}
    </div>
  );
}
