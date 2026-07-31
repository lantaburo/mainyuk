"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BLOCK_TYPE_LABELS } from "@/lib/empty-block";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import type { Block } from "@/lib/blocks-types";
import { blockArraySchema } from "@/lib/block-schema";
import { generatePageBlocksAction } from "@/app/dashboard/halaman/generate-action";
import { BlocksPreview } from "@/components/dashboard/BlocksPreview";
import { Progress } from "@/components/ui/progress";
import { SITE_TYPE_PROMPT_PLACEHOLDERS } from "@/lib/ai-prompt-placeholders";

/** Block sequence recommended per site type for the home page */
const SITE_TYPE_BLOCK_SEQUENCE: Record<SiteType, string[]> = {
  storefront: ["hero", "featured_products", "features", "testimonial", "cta"],
  sales_page: ["hero", "product_highlight", "features", "testimonial", "faq", "cta"],
  landing_page: ["hero", "features", "testimonial", "faq", "cta"],
  company_profile: ["hero", "about", "features", "testimonial", "contact"],
};

/** Block sequence for non-home pages */
const PAGE_TYPE_BLOCK_SEQUENCE: Record<string, string[]> = {
  about: ["about", "features", "testimonial"],
  contact: ["contact", "cta"],
};

interface AiGeneratorPanelProps {
  pageId: string;
  siteType: SiteType;
  pageType: string; // "home" | "about" | "contact"
  pageLabel: string; // label tampilan, mis. "Beranda", "Tentang Kami"
  hasExistingBlocks: boolean;
  storeSlug: string;
  themeColor: string;
  templateId: string | null;
  whatsappNumber?: string | null;
  onApply: (blocks: Block[], mode: "replace" | "append") => void;
}

export function AiGeneratorPanel({
  pageId,
  siteType,
  pageType,
  pageLabel,
  hasExistingBlocks,
  storeSlug,
  themeColor,
  templateId,
  whatsappNumber,
  onApply,
}: AiGeneratorPanelProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedBlocks, setGeneratedBlocks] = useState<Block[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  const config = SITE_TYPE_CONFIG[siteType];

  // Determine which blocks will be generated for this page
  const expectedSequence =
    pageType === "home"
      ? SITE_TYPE_BLOCK_SEQUENCE[siteType]
      : PAGE_TYPE_BLOCK_SEQUENCE[pageType] ?? [];

  // Allowed blocks for this site type (filter for non-home pages)
  const displayBlocks =
    expectedSequence.length > 0
      ? expectedSequence.filter((b) => config.allowedBlocks.includes(b as never))
      : config.allowedBlocks;

  function handleGenerate() {
    startTransition(async () => {
      setGeneratedBlocks(null);
      setShowPreview(false);
      const result = await generatePageBlocksAction(pageId, prompt);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setGeneratedBlocks(result.blocks);
      toast.success(`${result.blocks.length} section berhasil di-generate!`);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const result = blockArraySchema.safeParse(json);
        if (!result.success) {
          toast.error("File JSON tidak sesuai format block yang diharapkan.");
          return;
        }
        setGeneratedBlocks(result.data);
        toast.success(`Berhasil memuat ${result.data.length} section dari file.`);
      } catch {
        toast.error("File bukan JSON yang valid.");
      }
    };
    reader.onerror = () => toast.error("Gagal membaca file.");
    reader.readAsText(file);
  }

  function handleApply(mode: "replace" | "append") {
    if (!generatedBlocks) return;
    onApply(generatedBlocks, mode);
    setOpen(false);
    setGeneratedBlocks(null);
    setShowPreview(false);
    setPrompt("");
    toast.success(
      mode === "replace" ? "Halaman diganti dengan hasil AI" : "Section AI ditambahkan"
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:border-violet-800 dark:from-violet-950/30 dark:to-purple-950/30">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-violet-100/50 dark:hover:bg-violet-900/20"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white shadow-sm">
          ✨
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">
            Generate dengan AI
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900 dark:text-violet-300">
              {pageLabel}
            </span>
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400">
            AI akan mengisi section sesuai jenis situs{" "}
            <strong>{config.label}</strong> secara otomatis
          </p>
        </div>
        <span className="text-xs font-medium text-violet-400">
          {open ? "▲ Tutup" : "▼ Buka"}
        </span>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="space-y-4 border-t border-violet-200 p-4 dark:border-violet-800">
          {/* Expected blocks for this page/site */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Section yang akan di-generate untuk halaman{" "}
              <strong>{pageLabel}</strong> ({config.label}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displayBlocks.map((type, i) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300"
                >
                  <span className="font-bold text-violet-400">{i + 1}.</span>
                  {BLOCK_TYPE_LABELS[type as keyof typeof BLOCK_TYPE_LABELS] ?? type}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-1.5">
            <Label htmlFor={`ai-prompt-${pageId}`} className="text-sm font-medium">
              Deskripsi Bisnis Kamu
            </Label>
            <Textarea
              id={`ai-prompt-${pageId}`}
              rows={3}
              placeholder={SITE_TYPE_PROMPT_PLACEHOLDERS[siteType]}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none bg-white dark:bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Makin detail deskripsi, makin relevan hasilnya. Opsional tapi sangat disarankan.
            </p>
          </div>

          {/* Generate button */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full bg-violet-600 text-white hover:bg-violet-700"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sedang Generate…
              </span>
            ) : (
              "✨ Generate Section"
            )}
          </Button>

          {isPending && <Progress value={undefined} />}

          <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
            <div className="h-px flex-1 bg-border" />
            atau
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-sm font-medium">Upload file JSON (dari AI lain)</Label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-medium hover:bg-muted"
            />
          </div>

          {/* Preview hasil */}
          {generatedBlocks && (
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                ✅ {generatedBlocks.length} section siap diterapkan:
              </p>
              <ol className="space-y-1.5">
                {generatedBlocks.map((block, i) => (
                  <li key={block.id} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="font-medium text-green-900 dark:text-green-200">
                      {BLOCK_TYPE_LABELS[block.type]}
                    </span>
                    {"title" in block.data && block.data.title && (
                      <span className="truncate text-xs text-green-600 dark:text-green-400">
                        — {block.data.title as string}
                      </span>
                    )}
                  </li>
                ))}
              </ol>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? "Sembunyikan Pratinjau Halaman" : "👁 Lihat Pratinjau Halaman Penuh"}
              </Button>

              {showPreview && (
                <BlocksPreview
                  blocks={generatedBlocks}
                  storeSlug={storeSlug}
                  themeColor={themeColor}
                  templateId={templateId}
                  whatsappNumber={whatsappNumber}
                />
              )}

              {/* Apply buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleApply("replace")}
                >
                  Ganti Semua
                </Button>
                {hasExistingBlocks && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => handleApply("append")}
                  >
                    Tambahkan
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasExistingBlocks
                  ? '"Ganti Semua" menghapus section lama. "Tambahkan" menyisipkan di bawah yang ada.'
                  : "Klik Terapkan untuk mengisi editor dengan section hasil AI."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
