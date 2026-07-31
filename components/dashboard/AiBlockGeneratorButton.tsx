"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateSingleBlockAction } from "@/app/dashboard/halaman/generate-action";
import { Progress } from "@/components/ui/progress";
import type { BlockType } from "@/lib/site-types";
import type { Block } from "@/lib/blocks-types";

export function AiBlockGeneratorButton({
  storeId,
  blockType,
  onApply,
}: {
  storeId: string;
  blockType: BlockType;
  onApply: (data: Block["data"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    startTransition(async () => {
      try {
        const res = await generateSingleBlockAction(storeId, blockType, prompt);
        if (!res) {
          toast.error("Gagal menghubungi AI (Server Timeout).");
          return;
        }
        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onApply(res.data as any);
          toast.success("Blok berhasil di-generate dengan AI!");
          setOpen(false);
          setPrompt("");
        } else {
          toast.error(res.error);
        }
      } catch {
        toast.error("Gagal menghubungi server");
      }
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI</span>
          </Button>
        }
      />
      <PopoverContent className="w-80 p-4" align="end">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Generate via AI
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Jelaskan isi yang Anda inginkan untuk blok ini.
            </p>
          </div>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mis: Promosi sepatu diskon 50%"
            disabled={isPending}
            autoFocus
            className="text-sm"
          />
          <Button type="submit" disabled={isPending} size="sm" className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Menciptakan...
              </>
            ) : (
              "Generate"
            )}
          </Button>
          {isPending && <Progress value={null} />}
        </form>
      </PopoverContent>
    </Popover>
  );
}
