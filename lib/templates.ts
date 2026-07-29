export const TEMPLATE_PRESETS = ["modern", "classic", "minimalist"] as const;

export type TemplatePreset = (typeof TEMPLATE_PRESETS)[number];

export const DEFAULT_TEMPLATE: TemplatePreset = "modern";

interface TemplateStyle {
  label: string;
  description: string;
  radius: string;
  shadow: string;
}

export const TEMPLATE_STYLE: Record<TemplatePreset, TemplateStyle> = {
  modern: {
    label: "Modern",
    description: "Sudut membulat, bayangan lembut, tampilan lebih hidup.",
    radius: "1rem",
    shadow: "0 10px 25px -8px rgb(0 0 0 / 0.15)",
  },
  classic: {
    label: "Klasik",
    description: "Sudut tegas, border jelas, gaya formal dan tradisional.",
    radius: "0.25rem",
    shadow: "none",
  },
  minimalist: {
    label: "Minimalis",
    description: "Bersih, banyak ruang kosong, tanpa bayangan berlebih.",
    radius: "0.5rem",
    shadow: "none",
  },
};

export function isTemplatePreset(value: string): value is TemplatePreset {
  return (TEMPLATE_PRESETS as readonly string[]).includes(value);
}
