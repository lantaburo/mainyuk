import { z } from "zod";

export const designBriefSchema = z.object({
  goal: z.string(),
  targetAudience: z.string(),
  colorPalette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    neutral: z.string(),
    extra1: z.string().optional(),
    extra2: z.string().optional(),
  }),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  tone: z.string(),
  signatureElement: z.string(),
  sections: z
    .array(
      z.object({
        name: z.string(),
        purpose: z.string(),
        contentOutline: z.string(),
      })
    )
    .min(1),
});

export type DesignBrief = z.infer<typeof designBriefSchema>;
