"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { generateElementEditAction } from "@/app/dashboard/ai-generator/actions";

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
  const [isPending, startTransition] = useTransition();

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
        {isPending ? "Sedang mengubah…" : "Terapkan"}
      </Button>
      {isPending && <Progress value={null} />}
    </div>
  );
}
