"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildContentPrompt } from "@/lib/ai-prompt-generator";
import { generateContentWithAi, applyGeneratedBlocks } from "@/app/admin/actions";
import { blockArraySchema } from "@/lib/block-schema";
import type { SiteType } from "@/lib/site-types";
import type { Industry } from "@/lib/industry-content";
import type { Block } from "@/lib/blocks-types";

function blockSummary(block: Block): string {
  switch (block.type) {
    case "hero":
      return block.data.title;
    case "about":
      return block.data.title;
    case "banner":
      return block.data.image_url;
    case "cta":
      return block.data.title;
    case "contact":
      return block.data.address ?? block.data.phone ?? "-";
    case "faq":
      return `${block.data.items.length} pertanyaan`;
    case "features":
      return `${block.data.items.length} item`;
    case "testimonial":
      return `${block.data.items.length} testimoni`;
    case "featured_products":
      return block.data.title;
    case "product_highlight":
      return block.data.headline ?? "-";
  }
}

export function AiContentGenerator({
  storeId,
  storeSlug,
  storeName,
  siteType,
  industry,
  whatsappNumber,
  aiConfigured,
}: {
  storeId: string;
  storeSlug: string;
  storeName: string;
  siteType: SiteType;
  industry: Industry;
  whatsappNumber: string | null;
  aiConfigured: boolean;
}) {
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isApplying, startApplying] = useTransition();
  const [applied, setApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleGenerate() {
    setError(null);
    setBlocks(null);
    setApplied(false);
    startGenerating(async () => {
      const result = await generateContentWithAi(prompt);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBlocks(result.blocks);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setApplied(false);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const result = blockArraySchema.safeParse(json);
        if (!result.success) {
          setBlocks(null);
          setError("File JSON tidak sesuai format block yang diharapkan.");
          return;
        }
        setBlocks(result.data);
      } catch {
        setBlocks(null);
        setError("File bukan JSON yang valid.");
      }
    };
    reader.onerror = () => setError("Gagal membaca file.");
    reader.readAsText(file);
  }

  function handleApply() {
    if (!blocks) return;
    startApplying(async () => {
      try {
        await applyGeneratedBlocks(storeId, blocks);
        setApplied(true);
        toast.success("Konten diterapkan ke toko");
      } catch {
        toast.error("Gagal menerapkan konten ke toko");
      }
    });
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

      <details className="rounded-lg border p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          Lihat / salin prompt mentah (untuk dipakai manual di AI lain)
        </summary>
        <div className="mt-3 space-y-2">
          <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
            Salin Prompt
          </Button>
          <Textarea readOnly rows={10} value={prompt} className="font-mono text-xs" />
        </div>
      </details>

      {!aiConfigured ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Pengaturan AI belum diisi.{" "}
          <Link href="/admin/pengaturan-ai" className="underline">
            Buka Pengaturan AI
          </Link>{" "}
          untuk mengisi Base URL, API Key, dan model terlebih dahulu.
        </div>
      ) : (
        <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? "Menghasilkan..." : "Generate dengan AI"}
        </Button>
      )}

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        atau
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jsonUpload">Upload file JSON hasil generate (mis. dari AI lain)</Label>
        <input
          id="jsonUpload"
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {blocks && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Preview Hasil ({blocks.length} block)</p>
          <div className="space-y-2">
            {[...blocks]
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div key={block.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{block.type}</Badge>
                  <span className="truncate text-muted-foreground">{blockSummary(block)}</span>
                </div>
              ))}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Lihat JSON mentah</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2">
              {JSON.stringify(blocks, null, 2)}
            </pre>
          </details>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleApply} disabled={isApplying || applied}>
              {applied ? "Sudah Diterapkan" : isApplying ? "Menerapkan..." : "Terapkan ke Toko"}
            </Button>
            {applied && (
              <a
                href={`/${storeSlug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                Lihat storefront →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
