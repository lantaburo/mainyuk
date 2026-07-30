"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TEMPLATE_STYLE, DEFAULT_TEMPLATE, isTemplatePreset } from "@/lib/templates";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import type { DesignBrief } from "@/lib/ai-html-schema";
import type { AiUsage } from "@/lib/ai-client";
import { STREAM_DONE_MARKER } from "@/lib/streaming-protocol";
import { cn } from "@/lib/utils";
import { generateBriefAction, applyGeneratedHtmlAction } from "@/lib/ai-actions";

type Step = "form" | "brief" | "loading" | "result";

const STEP_LABELS: Record<Step, string> = {
  form: "Deskripsi",
  brief: "Blueprint",
  loading: "Generate",
  result: "Hasil",
};

function UsageBadge({ label, usage }: { label: string; usage: AiUsage | null }) {
  if (!usage) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
      {label}: <strong className="font-medium text-foreground">{usage.totalTokens.toLocaleString("id-ID")}</strong> token
    </span>
  );
}

export function AiWebsiteGeneratorWizard({
  storeId,
  pageId,
  storeSlug,
  siteType,
  themeColor,
  templateId,
  targetAudience,
  hasExistingHtml,
}: {
  storeId: string;
  pageId: string;
  storeSlug: string;
  siteType: SiteType;
  themeColor: string;
  templateId: string | null;
  targetAudience: string | null;
  hasExistingHtml: boolean;
}) {
  const router = useRouter();
  const config = SITE_TYPE_CONFIG[siteType];

  const [step, setStep] = useState<Step>("form");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState(targetAudience ?? "");
  const [brief, setBrief] = useState<DesignBrief | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [briefUsage, setBriefUsage] = useState<AiUsage | null>(null);
  const [htmlUsage, setHtmlUsage] = useState<AiUsage | null>(null);
  const [streamingCode, setStreamingCode] = useState("");
  const [isStreamingHtml, setIsStreamingHtml] = useState(false);
  const [isEnrichingImages, setIsEnrichingImages] = useState(false);
  const [enrichedPhotos, setEnrichedPhotos] = useState<{ sectionName: string; photographer: string; pexelsLink: string }[]>([]);
  const [isBriefPending, startBrief] = useTransition();
  const [isApplying, startApplying] = useTransition();

  // Animated progress for blueprint generation
  const [briefProgress, setBriefProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BRIEF_PHASES = [
    { label: "Menganalisis deskripsi bisnis…", from: 0,  to: 30, duration: 4000 },
    { label: "Merancang identitas visual…",   from: 30, to: 65, duration: 6000 },
    { label: "Menyusun blueprint section…",   from: 65, to: 88, duration: 5000 },
    { label: "Menyelesaikan blueprint…",       from: 88, to: 95, duration: 4000 },
  ];

  useEffect(() => {
    if (isBriefPending) {
      setBriefProgress(0);
      let phaseIdx = 0;
      let startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        const phase = BRIEF_PHASES[phaseIdx];
        if (!phase) return;
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / phase.duration, 1);
        // Ease-out: fast start, slow finish
        const eased = 1 - Math.pow(1 - ratio, 3);
        const value = phase.from + (phase.to - phase.from) * eased;
        setBriefProgress(Math.round(value));
        if (ratio >= 1 && phaseIdx < BRIEF_PHASES.length - 1) {
          phaseIdx++;
          startTime = Date.now();
        }
      }, 60);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Snap to 100 briefly then reset
      setBriefProgress(100);
      const t = setTimeout(() => setBriefProgress(0), 500);
      return () => clearTimeout(t);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBriefPending]);

  const codeBoxRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    codeBoxRef.current?.scrollTo({ top: codeBoxRef.current.scrollHeight });
  }, [streamingCode]);

  function handleGenerateBrief() {
    if (!description.trim()) {
      toast.error("Isi deskripsi bisnis dulu.");
      return;
    }
    startBrief(async () => {
      const res = await generateBriefAction(storeId, description, audience);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setBrief(res.brief);
      setBriefUsage(res.usage);
      setStep("brief");
    });
  }

  function updateBriefField<K extends keyof DesignBrief>(field: K, value: DesignBrief[K]) {
    setBrief((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function updateSection(index: number, field: "name" | "purpose" | "contentOutline", value: string) {
    setBrief((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, sections };
    });
  }

  async function handleConfirm() {
    if (!brief) return;
    setStep("loading");
    setStreamingCode("");
    setIsStreamingHtml(true);
    setEnrichedPhotos([]);

    try {
      const res = await fetch("/api/ai-generator/stream-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, brief }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        toast.error(text || "Gagal menghubungi AI.");
        setStep("brief");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const markerIndex = full.indexOf(STREAM_DONE_MARKER);
        setStreamingCode(markerIndex === -1 ? full : full.slice(0, markerIndex));
      }

      const markerIndex = full.indexOf(STREAM_DONE_MARKER);
      if (markerIndex === -1) {
        toast.error("Respons AI terputus, coba lagi.");
        setStep("brief");
        return;
      }

      const finalPayload = JSON.parse(full.slice(markerIndex + STREAM_DONE_MARKER.length));
      if (finalPayload.error) {
        toast.error(finalPayload.error);
        setStep("brief");
        return;
      }

      setIsStreamingHtml(false);

      // ── Enrich: inject foto Pexels ke section yang butuh ──
      let finalHtml = finalPayload.html as string;
      setIsEnrichingImages(true);
      try {
        const enrichRes = await fetch("/api/ai-generator/enrich-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, brief, html: finalHtml }),
        });
        if (enrichRes.ok) {
          const enrichData = await enrichRes.json();
          finalHtml = enrichData.html ?? finalHtml;
          if (enrichData.photos?.length) setEnrichedPhotos(enrichData.photos);
        }
      } catch {
        // Enrichment gagal → tetap lanjut dengan HTML tanpa foto
      } finally {
        setIsEnrichingImages(false);
      }
      // ─────────────────────────────────────────

      setHtml(finalHtml);
      setHtmlUsage(finalPayload.usage ?? null);
      setStep("result");
    } catch {
      toast.error("Gagal menghubungi AI.");
      setStep("brief");
    } finally {
      setIsStreamingHtml(false);
      setIsEnrichingImages(false);
    }
  }

  function handleApply() {
    if (!html || !brief) return;
    startApplying(async () => {
      const res = await applyGeneratedHtmlAction(pageId, html, brief);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Website berhasil diterapkan!");
      router.push("/editor");
    });
  }

  const templateStyle =
    TEMPLATE_STYLE[templateId && isTemplatePreset(templateId) ? templateId : DEFAULT_TEMPLATE];
  const themeStyle = {
    "--store-primary": themeColor,
    "--store-radius": templateStyle.radius,
    "--store-shadow": templateStyle.shadow,
  } as CSSProperties;

  return (
    <div className="space-y-6">
      {hasExistingHtml && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 dark:border-indigo-800 dark:bg-indigo-950/30">
          <div>
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              Halaman Beranda sudah punya konten
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Buka editor untuk edit teks/gaya per elemen, atau lanjutkan di bawah untuk generate ulang dari awal.
            </p>
          </div>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/editor" />}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Buka Editor
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {(Object.keys(STEP_LABELS) as Step[]).map((s, i) => (
            <li key={s} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium",
                  step === s
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span className={cn(step === s && "font-semibold text-foreground")}>{STEP_LABELS[s]}</span>
              {i < 3 && <span className="mx-1 text-muted-foreground/30">→</span>}
            </li>
          ))}
        </ol>
        {(briefUsage || htmlUsage) && (
          <div className="flex flex-wrap gap-1.5">
            <UsageBadge label="Blueprint" usage={briefUsage} />
            <UsageBadge label="Kode HTML" usage={htmlUsage} />
          </div>
        )}
      </div>

      {step === "form" && (
        <div className="space-y-4 rounded-xl border p-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Jenis Situs</Label>
            <p className="text-sm text-muted-foreground">
              {config.label} — {config.description}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-gen-description" className="text-sm font-medium">
              Deskripsi Bisnis
            </Label>
            <Textarea
              id="ai-gen-description"
              rows={4}
              placeholder="Contoh: Toko kopi warna coklat krem, ada menu, lokasi, testimoni. Target anak muda kantoran yang suka nongkrong."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBriefPending}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-gen-audience" className="text-sm font-medium">
              Target Pengunjung / Gaya Desain <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Textarea
              id="ai-gen-audience"
              rows={2}
              placeholder="Contoh: kelas menengah, usia 20-35, gaya santai & akrab, area Jakarta"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isBriefPending}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-muted-foreground self-center mr-1">Rekomendasi gaya:</span>
              {[
                "Minimalis Elegan",
                "Playful & Vibrant",
                "Premium Dark Mode",
                "Corporate Profesional",
                "Soft Pastel",
                "Modern Glassmorphism"
              ].map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setAudience(prev => prev ? `${prev}, Gaya: ${style}` : `Gaya: ${style}`)}
                  className="rounded-full border border-indigo-100 bg-indigo-50/50 px-2.5 py-1 text-[10px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                >
                  + {style}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Menentukan gaya visual (modern, dark mode, dll), warna, tipografi, dan nada tulisan dari AI.
            </p>
          </div>

          <Button onClick={handleGenerateBrief} disabled={isBriefPending} className="w-full">
            {isBriefPending ? "Menyusun Blueprint…" : "Perbaiki Prompt"}
          </Button>
          {isBriefPending && (
            <div className="space-y-2 pt-1">
              {/* Label fase */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground animate-pulse">
                  {BRIEF_PHASES.find((p) => briefProgress >= p.from && briefProgress < p.to)?.label
                    ?? (briefProgress >= 95 ? "Menyelesaikan blueprint…" : "Memulai…")}
                </span>
                <span className="tabular-nums font-semibold text-foreground">{briefProgress}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${briefProgress}%`,
                    background: "linear-gradient(90deg, var(--store-primary, #6366f1) 0%, color-mix(in srgb, var(--store-primary, #6366f1) 70%, #a78bfa) 100%)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {step === "brief" && brief && (
        <div className="space-y-4 rounded-xl border p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tujuan Halaman</Label>
              <Textarea
                rows={2}
                value={brief.goal}
                onChange={(e) => updateBriefField("goal", e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target Audiens</Label>
              <Textarea
                rows={2}
                value={brief.targetAudience}
                onChange={(e) => updateBriefField("targetAudience", e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Palet Warna</Label>
            <div className="flex flex-wrap gap-2">
              {(["primary", "secondary", "accent", "neutral", "extra1", "extra2"] as const).map((key) => {
                const value = brief.colorPalette[key];
                if (key.startsWith("extra") && !value) return null;
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border"
                      style={{ background: value || "#e5e7eb" }}
                    />
                    <Input
                      value={value ?? ""}
                      onChange={(e) =>
                        updateBriefField("colorPalette", { ...brief.colorPalette, [key]: e.target.value })
                      }
                      className="h-8 w-24 text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nada Tulisan</Label>
              <Input value={brief.tone} onChange={(e) => updateBriefField("tone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Elemen Khas</Label>
              <Input
                value={brief.signatureElement}
                onChange={(e) => updateBriefField("signatureElement", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Susunan Section</Label>
            {brief.sections.map((section, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <Input
                  value={section.name}
                  onChange={(e) => updateSection(i, "name", e.target.value)}
                  className="h-8 font-medium"
                />
                <Textarea
                  rows={2}
                  value={section.contentOutline}
                  onChange={(e) => updateSection(i, "contentOutline", e.target.value)}
                  className="resize-none text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
              Reset Prompt
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Konfirmasi & Buat Website
            </Button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="space-y-3 rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {isEnrichingImages
                ? "Mencari foto untuk section website…"
                : isStreamingHtml
                ? "AI sedang menyusun kode halaman website-mu…"
                : "Menyelesaikan…"}
            </p>
            <span className="text-xs text-muted-foreground">
              {isEnrichingImages ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full" style={{ background: "var(--store-primary, #6366f1)" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full [animation-delay:0.15s]" style={{ background: "var(--store-primary, #6366f1)" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full [animation-delay:0.3s]" style={{ background: "var(--store-primary, #6366f1)" }} />
                </span>
              ) : (
                `${streamingCode.length.toLocaleString("id-ID")} karakter`
              )}
            </span>
          </div>
          {!isEnrichingImages && (
            <pre
              ref={codeBoxRef}
              className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-400"
            >
              {streamingCode || "Menghubungi AI…"}
              {isStreamingHtml && <span className="animate-pulse">▌</span>}
            </pre>
          )}
          {isEnrichingImages && (
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <svg className="h-8 w-8 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
              </svg>
              <div>
                <p className="font-medium text-foreground">Mencari foto dari Pexels…</p>
                <p className="text-xs">Mencocokkan foto dengan setiap section website</p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "result" && html && (
        <div className="space-y-4">
          {/* Badge foto Pexels */}
          {enrichedPhotos.length > 0 && (
            <div className="flex flex-wrap items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">📷 {enrichedPhotos.length} foto dari Pexels disuntikkan:</span>
              <div className="flex flex-wrap gap-1.5">
                {enrichedPhotos.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    {p.sectionName} ·{" "}
                    <a href={p.pexelsLink} target="_blank" rel="noopener noreferrer" className="underline">
                      {p.photographer}
                    </a>
                  </span>
                ))}
              </div>
              <p className="w-full text-[11px] text-blue-500 dark:text-blue-400">Foto bisa diganti di editor setelah diterapkan.</p>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border">
            <div className="flex items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">Pratinjau halaman</span>
            </div>
            <div
              style={themeStyle}
              className="max-h-[70vh] overflow-y-auto bg-white"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("brief")} disabled={isStreamingHtml}>
              ← Ubah Blueprint
            </Button>
            <Button onClick={handleApply} disabled={isApplying} className="flex-1 bg-green-600 text-white hover:bg-green-700">
              {isApplying ? "Menerapkan…" : "Terapkan ke Toko"}
            </Button>
          </div>
          {hasExistingHtml && (
            <p className="text-xs text-muted-foreground">
              Halaman Beranda saat ini sudah punya konten (
              <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer" className="underline">
                lihat yang tayang sekarang
              </a>
              ) — menerapkan ini akan menggantinya.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
