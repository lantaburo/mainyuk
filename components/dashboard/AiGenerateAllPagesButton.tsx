"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SiteType } from "@/lib/site-types";
import {
  generateAllPagesAction,
  type GenerateAllPagesResult,
} from "@/app/dashboard/halaman/generate-action";
import { updatePageBlocks } from "@/app/dashboard/halaman/actions";
import { BlocksPreview } from "@/components/dashboard/BlocksPreview";

const PLACEHOLDER_EXAMPLES: Record<SiteType, string> = {
  storefront:
    "Contoh: Toko fashion lokal menjual kaos distro dan jaket streetwear, target anak muda 18-30 tahun, bahan premium, harga 150-400rb.",
  sales_page:
    "Contoh: Jual suplemen herbal pelangsing alami, sudah terjual 5.000+ botol, aman tanpa efek samping, garansi uang kembali 30 hari.",
  landing_page:
    "Contoh: Kursus desain grafis online untuk pemula, 30 modul video, sertifikat, mentor berpengalaman, harga promo Rp 299.000.",
  company_profile:
    "Contoh: PT Maju Bersama, perusahaan konsultan IT berdiri 2010, melayani 200+ klien korporat, spesialis transformasi digital.",
};

export function AiGenerateAllPagesButton({
  storeId,
  siteType,
  pages,
  storeSlug,
  themeColor,
  templateId,
  whatsappNumber,
}: {
  storeId: string;
  siteType: SiteType;
  pages: { pageType: string; label: string }[];
  storeSlug: string;
  themeColor: string;
  templateId: string | null;
  whatsappNumber?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<GenerateAllPagesResult[] | null>(null);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isApplying, startApplying] = useTransition();

  function handleGenerate() {
    startGenerating(async () => {
      setResults(null);
      setPreviewPageId(null);
      const res = await generateAllPagesAction(storeId, prompt);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResults(res.pages);
      const okCount = res.pages.filter((p) => p.result.ok).length;
      if (okCount === 0) {
        toast.error("AI gagal generate semua halaman.");
      } else {
        toast.success(`${okCount} dari ${res.pages.length} halaman berhasil di-generate!`);
      }
    });
  }

  function handleApplyAll() {
    if (!results) return;
    const succeeded = results.filter((p) => p.result.ok);
    if (succeeded.length === 0) return;

    startApplying(async () => {
      try {
        await Promise.all(
          succeeded.map((p) =>
            p.result.ok ? updatePageBlocks(p.pageId, p.result.blocks) : Promise.resolve()
          )
        );
        toast.success(`${succeeded.length} halaman berhasil diterapkan!`);
        setOpen(false);
        setResults(null);
        setPreviewPageId(null);
        setPrompt("");
        router.refresh();
      } catch {
        toast.error("Gagal menerapkan sebagian halaman.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-violet-950/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white shadow-sm">
          🪄
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            Generate Semua Halaman dengan AI
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            Isi {pages.length} halaman ({pages.map((p) => p.label).join(", ")}) sekaligus dalam satu klik
          </p>
        </div>
        <span className="text-xs font-medium text-indigo-400">{open ? "▲ Tutup" : "▼ Buka"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-indigo-200 p-4 dark:border-indigo-800">
          <div className="space-y-1.5">
            <Label htmlFor="ai-all-pages-prompt" className="text-sm font-medium">
              Deskripsi Bisnis Kamu
            </Label>
            <Textarea
              id="ai-all-pages-prompt"
              rows={3}
              placeholder={PLACEHOLDER_EXAMPLES[siteType]}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none bg-white dark:bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Satu deskripsi ini dipakai untuk menyusun semua halaman sekaligus.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sedang Generate Semua Halaman…
              </span>
            ) : (
              "🪄 Generate Semua Halaman"
            )}
          </Button>

          {results && (
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <ul className="space-y-2">
                {results.map((p) => (
                  <li key={p.pageId} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {p.result.ok ? "✅" : "⚠️"} {p.pageLabel}
                        {p.result.ok && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            ({p.result.blocks.length} section)
                          </span>
                        )}
                      </span>
                      {p.result.ok ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 border-green-300 text-xs text-green-700 hover:bg-green-100"
                          onClick={() =>
                            setPreviewPageId((cur) => (cur === p.pageId ? null : p.pageId))
                          }
                        >
                          {previewPageId === p.pageId ? "Sembunyikan" : "Lihat Pratinjau"}
                        </Button>
                      ) : (
                        <span className="text-xs text-red-600">{p.result.error}</span>
                      )}
                    </div>
                    {p.result.ok && previewPageId === p.pageId && (
                      <BlocksPreview
                        blocks={p.result.blocks}
                        storeSlug={storeSlug}
                        themeColor={themeColor}
                        templateId={templateId}
                        whatsappNumber={whatsappNumber}
                      />
                    )}
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                size="sm"
                className="w-full bg-green-600 text-white hover:bg-green-700"
                onClick={handleApplyAll}
                disabled={isApplying || results.every((p) => !p.result.ok)}
              >
                {isApplying ? "Menerapkan…" : "Terapkan ke Semua Halaman (Ganti Semua)"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Ini akan mengganti isi setiap halaman yang berhasil di-generate. Halaman yang gagal tidak berubah.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
