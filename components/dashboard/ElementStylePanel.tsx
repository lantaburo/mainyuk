"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ElementStyleValues {
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderRadius: number;
}

const TEXT_ALIGN_OPTIONS = ["left", "center", "right"] as const;

/**
 * Style editor for a single selected DOM element in the visual page editor.
 * Same control patterns as the old block StylePanel.tsx (color pair,
 * sliders, segmented alignment buttons) but reads/writes the element's
 * actual inline style directly instead of a fixed BlockStyleOverrides shape.
 */
export function ElementStylePanel({
  values,
  onChange,
}: {
  values: ElementStyleValues;
  onChange: (patch: Partial<ElementStyleValues>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Warna Teks</Label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={values.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="h-8 w-8 shrink-0 cursor-pointer rounded border"
            />
            <Input
              value={values.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Warna Latar</Label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={values.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="h-8 w-8 shrink-0 cursor-pointer rounded border"
            />
            <Input
              value={values.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Ukuran Teks — {values.fontSize}px</Label>
        <Slider
          min={10}
          max={96}
          step={1}
          value={[values.fontSize]}
          onValueChange={(v) => onChange({ fontSize: Array.isArray(v) ? v[0] : v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Ketebalan</Label>
          <Select value={values.fontWeight} onValueChange={(v) => v && onChange({ fontWeight: v })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Normal</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semi Bold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
              <SelectItem value="800">Extra Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Rata Teks</Label>
          <div className="flex rounded-md bg-muted p-1">
            {TEXT_ALIGN_OPTIONS.map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onChange({ textAlign: align })}
                className={cn(
                  "flex-1 rounded px-2 py-1 text-xs capitalize transition-colors",
                  values.textAlign === align
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {align === "left" ? "Kiri" : align === "center" ? "Tengah" : "Kanan"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          Padding Atas/Bawah — {values.paddingTop}px / {values.paddingBottom}px
        </Label>
        <Slider
          min={0}
          max={160}
          step={4}
          value={[values.paddingTop]}
          onValueChange={(v) => onChange({ paddingTop: Array.isArray(v) ? v[0] : v })}
        />
        <Slider
          min={0}
          max={160}
          step={4}
          value={[values.paddingBottom]}
          onValueChange={(v) => onChange({ paddingBottom: Array.isArray(v) ? v[0] : v })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          Padding Kiri/Kanan — {values.paddingLeft}px / {values.paddingRight}px
        </Label>
        <Slider
          min={0}
          max={160}
          step={4}
          value={[values.paddingLeft]}
          onValueChange={(v) => onChange({ paddingLeft: Array.isArray(v) ? v[0] : v })}
        />
        <Slider
          min={0}
          max={160}
          step={4}
          value={[values.paddingRight]}
          onValueChange={(v) => onChange({ paddingRight: Array.isArray(v) ? v[0] : v })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Sudut Membulat — {values.borderRadius}px</Label>
        <Slider
          min={0}
          max={48}
          step={2}
          value={[values.borderRadius]}
          onValueChange={(v) => onChange({ borderRadius: Array.isArray(v) ? v[0] : v })}
        />
      </div>
    </div>
  );
}
