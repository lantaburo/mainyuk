"use client";

import { BlockStyleOverrides } from "@/lib/blocks-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { MediaUploadField } from "./MediaUploadField";

const PRESET_FONTS = [
  { label: "Default (Inter)", value: "" },
  { label: "Serif (Playfair)", value: "Playfair Display, serif" },
  { label: "Modern (Plus Jakarta)", value: "Plus Jakarta Sans, sans-serif" },
  { label: "Monospace (JetBrains)", value: "JetBrains Mono, monospace" },
  { label: "Fun (Comic Neue)", value: "Comic Neue, cursive" },
];

const ANIMATIONS = [
  { label: "None", value: "none" },
  { label: "Fade Up", value: "fade-up" },
  { label: "Fade In", value: "fade-in" },
  { label: "Slide Left", value: "slide-left" },
  { label: "Slide Right", value: "slide-right" },
  { label: "Zoom In", value: "zoom-in" },
];

interface StylePanelProps {
  styles?: BlockStyleOverrides;
  onChange: (styles: BlockStyleOverrides) => void;
  storeId?: string;
}

export function StylePanel({ styles = {}, onChange, storeId }: StylePanelProps) {
  const updateStyle = (key: keyof BlockStyleOverrides, value: string | number | boolean) => {
    onChange({ ...styles, [key]: value });
  };

  return (
    <Accordion multiple defaultValue={["colors", "spacing"]} className="w-full space-y-2">
      {/* ─── COLORS ─── */}
      <AccordionItem value="colors" className="border-none bg-zinc-900 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800 hover:no-underline text-sm font-medium text-white data-[state=open]:bg-zinc-800">
          🎨 Colors
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Background</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.bg_color ?? "#ffffff"}
                  onChange={(e) => updateStyle("bg_color", e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <Input
                  value={styles.bg_color ?? ""}
                  onChange={(e) => updateStyle("bg_color", e.target.value)}
                  placeholder="#hex"
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Text</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.text_color ?? "#000000"}
                  onChange={(e) => updateStyle("text_color", e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <Input
                  value={styles.text_color ?? ""}
                  onChange={(e) => updateStyle("text_color", e.target.value)}
                  placeholder="#hex"
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Button BG</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.btn_color ?? "#4f46e5"}
                  onChange={(e) => updateStyle("btn_color", e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <Input
                  value={styles.btn_color ?? ""}
                  onChange={(e) => updateStyle("btn_color", e.target.value)}
                  placeholder="#hex"
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Button Text</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.btn_text_color ?? "#ffffff"}
                  onChange={(e) => updateStyle("btn_text_color", e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <Input
                  value={styles.btn_text_color ?? ""}
                  onChange={(e) => updateStyle("btn_text_color", e.target.value)}
                  placeholder="#hex"
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── TYPOGRAPHY ─── */}
      <AccordionItem value="typography" className="border-none bg-zinc-900 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800 hover:no-underline text-sm font-medium text-white data-[state=open]:bg-zinc-800">
          ✍️ Typography
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Font Family</Label>
            <Select value={styles.font_family ?? ""} onValueChange={(v) => updateStyle("font_family", v)}>
              <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300">
                <SelectValue placeholder="Pilih font..." />
              </SelectTrigger>
              <SelectContent>
                {PRESET_FONTS.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Style</Label>
              <Select value={styles.font_style ?? "normal"} onValueChange={(v) => updateStyle("font_style", v)}>
                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="bold-italic">Bold Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Base Size</Label>
              <Select value={styles.font_size ?? "base"} onValueChange={(v) => updateStyle("font_size", v)}>
                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Normal</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                  <SelectItem value="2xl">2XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── SPACING ─── */}
      <AccordionItem value="spacing" className="border-none bg-zinc-900 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800 hover:no-underline text-sm font-medium text-white data-[state=open]:bg-zinc-800">
          📐 Spacing
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Padding Top</Label>
              <span className="text-xs text-zinc-500">{styles.padding_top ?? 64}px</span>
            </div>
            <Slider
              value={[styles.padding_top ?? 64]}
              min={0}
              max={200}
              step={4}
              onValueChange={(val) => updateStyle("padding_top", Array.isArray(val) ? val[0] : val)}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Padding Bottom</Label>
              <span className="text-xs text-zinc-500">{styles.padding_bottom ?? 64}px</span>
            </div>
            <Slider
              value={[styles.padding_bottom ?? 64]}
              min={0}
              max={200}
              step={4}
              onValueChange={(val) => updateStyle("padding_bottom", Array.isArray(val) ? val[0] : val)}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Padding X (Horizontal)</Label>
              <span className="text-xs text-zinc-500">{styles.padding_x ?? 24}px</span>
            </div>
            <Slider
              value={[styles.padding_x ?? 24]}
              min={0}
              max={120}
              step={4}
              onValueChange={(val) => updateStyle("padding_x", Array.isArray(val) ? val[0] : val)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── ALIGNMENT ─── */}
      <AccordionItem value="alignment" className="border-none bg-zinc-900 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800 hover:no-underline text-sm font-medium text-white data-[state=open]:bg-zinc-800">
          ↔️ Alignment
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Text Align</Label>
            <div className="flex bg-zinc-950 p-1 rounded-md">
              {(["left", "center", "right"] as const).map(a => (
                <button
                  key={a}
                  className={`flex-1 text-xs py-1 rounded capitalize ${styles.text_align === a ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  onClick={() => updateStyle("text_align", a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Content Align</Label>
            <div className="flex bg-zinc-950 p-1 rounded-md">
              {(["left", "center", "right"] as const).map(a => (
                <button
                  key={a}
                  className={`flex-1 text-xs py-1 rounded capitalize ${styles.content_align === a ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  onClick={() => updateStyle("content_align", a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── ANIMATION ─── */}
      <AccordionItem value="animation" className="border-none bg-zinc-900 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800 hover:no-underline text-sm font-medium text-white data-[state=open]:bg-zinc-800">
          ✨ Animation
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Entry Animation</Label>
            <Select value={styles.animation ?? "none"} onValueChange={(v) => updateStyle("animation", v)}>
              <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATIONS.map(a => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Delay</Label>
              <span className="text-xs text-zinc-500">{styles.animation_delay ?? 0}ms</span>
            </div>
            <Slider
              value={[styles.animation_delay ?? 0]}
              min={0}
              max={1000}
              step={100}
              onValueChange={(val) => updateStyle("animation_delay", Array.isArray(val) ? val[0] : val)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── BACKGROUND MEDIA ─── */}
      <AccordionItem value="bg_media" className="border-none bg-zinc-900 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800 hover:no-underline text-sm font-medium text-white data-[state=open]:bg-zinc-800">
          🎬 Background Video
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Upload Background Video</Label>
            <MediaUploadField
              label="BG Media"
              value={styles.bg_video_url ?? ""}
              onChange={(url) => updateStyle("bg_video_url", url)}
              storeId={storeId}
            />
          </div>
          {styles.bg_video_url && (
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Loop Video</Label>
              <Switch
                checked={styles.bg_video_loop ?? true}
                onCheckedChange={(c) => updateStyle("bg_video_loop", c)}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
