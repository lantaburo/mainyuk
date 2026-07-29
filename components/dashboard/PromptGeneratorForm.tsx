"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { buildContentPrompt } from "@/lib/ai-prompt-generator";
import type { SiteType } from "@/lib/site-types";
import type { Industry } from "@/lib/industry-content";

export function PromptGeneratorForm({
  storeName,
  siteType,
  industry,
  whatsappNumber,
}: {
  storeName: string;
  siteType: SiteType;
  industry: Industry;
  whatsappNumber: string | null;
}) {
  const [description, setDescription] = useState("");

  const prompt = useMemo(
    () =>
      buildContentPrompt({
        storeName,
        siteType,
        industry,
        businessDescription: description,
        whatsappNumber,
      }),
    [storeName, siteType, industry, description, whatsappNumber]
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    toast.success("Prompt disalin ke clipboard");
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi Singkat Bisnis (opsional, tapi disarankan)</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Contoh: Jual kaos distro lokal untuk anak muda, bahan combed 24s, fokus desain minimalis."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt">Prompt Siap Pakai</Label>
          <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
            Salin
          </Button>
        </div>
        <Textarea
          id="prompt"
          readOnly
          rows={20}
          value={prompt}
          className="font-mono text-xs"
          onFocus={(e) => e.currentTarget.select()}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Salin prompt di atas, tempel ke Gemini/ChatGPT (atau AI lain), lalu salin hasil JSON-nya ke
        field yang sesuai di{" "}
        <a href="/dashboard/halaman" className="underline">
          editor Halaman
        </a>
        .
      </p>
    </div>
  );
}
