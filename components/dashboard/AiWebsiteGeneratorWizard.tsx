"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TEMPLATE_STYLE, DEFAULT_TEMPLATE, isTemplatePreset } from "@/lib/templates";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import type { DesignBrief } from "@/lib/ai-html-schema";
import { cn } from "@/lib/utils";
import {
  generateBriefAction,
  generateHtmlFromBriefAction,
  applyGeneratedHtmlAction,
} from "@/app/dashboard/ai-generator/actions";

type Step = "form" | "brief" | "loading" | "result";

const STEP_LABELS: Record<Step, string> = {
  form: "Deskripsi",
  brief: "Blueprint",
  loading: "Generate",
  result: "Hasil",
};

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
  const [isBriefPending, startBrief] = useTransition();
  const [isHtmlPending, startHtml] = useTransition();
  const [isApplying, startApplying] = useTransition();

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

  function handleConfirm() {
    if (!brief) return;
    setStep("loading");
    startHtml(async () => {
      const res = await generateHtmlFromBriefAction(storeId, brief);
      if (!res.ok) {
        toast.error(res.error);
        setStep("brief");
        return;
      }
      setHtml(res.html);
      setStep("result");
    });
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
      router.refresh();
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
              Segmen Pasar / Target Pengunjung <span className="font-normal text-muted-foreground">(opsional)</span>
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
            <p className="text-xs text-muted-foreground">
              Menentukan gaya warna, tipografi, dan nada tulisan yang direkomendasikan AI.
            </p>
          </div>

          <Button onClick={handleGenerateBrief} disabled={isBriefPending} className="w-full">
            {isBriefPending ? "Menyusun Blueprint…" : "Perbaiki Prompt"}
          </Button>
          {isBriefPending && <Progress value={null} />}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Palet Warna</Label>
              <div className="flex gap-2">
                {(["primary", "secondary", "accent"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border"
                      style={{ background: brief.colorPalette[key] }}
                    />
                    <Input
                      value={brief.colorPalette[key]}
                      onChange={(e) =>
                        updateBriefField("colorPalette", { ...brief.colorPalette, [key]: e.target.value })
                      }
                      className="h-8 w-24 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nada Tulisan</Label>
              <Input value={brief.tone} onChange={(e) => updateBriefField("tone", e.target.value)} />
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
        <div className="space-y-4 rounded-xl border p-10 text-center">
          <p className="text-sm font-medium">AI sedang menyusun kode halaman website-mu…</p>
          <Progress value={null} />
        </div>
      )}

      {step === "result" && html && (
        <div className="space-y-4">
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
            <Button variant="outline" onClick={() => setStep("brief")} disabled={isHtmlPending}>
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
