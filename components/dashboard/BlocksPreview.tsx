"use client";

import type { CSSProperties } from "react";
import type { Block } from "@/lib/blocks-types";
import { BlockRendererClient } from "@/components/storefront/blocks/BlockRendererClient";
import { TEMPLATE_STYLE, DEFAULT_TEMPLATE, isTemplatePreset } from "@/lib/templates";

/** Full visual preview of a set of blocks, styled with the store's actual theme/template. */
export function BlocksPreview({
  blocks,
  storeSlug,
  themeColor,
  templateId,
  whatsappNumber,
}: {
  blocks: Block[];
  storeSlug: string;
  themeColor: string;
  templateId: string | null;
  whatsappNumber?: string | null;
}) {
  const templateStyle =
    TEMPLATE_STYLE[templateId && isTemplatePreset(templateId) ? templateId : DEFAULT_TEMPLATE];
  const themeStyle = {
    "--store-primary": themeColor,
    "--store-radius": templateStyle.radius,
    "--store-shadow": templateStyle.shadow,
  } as CSSProperties;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-muted-foreground">Pratinjau halaman</span>
      </div>
      <div style={themeStyle} className="max-h-[70vh] overflow-y-auto bg-white">
        <BlockRendererClient blocks={blocks} storeSlug={storeSlug} whatsappNumber={whatsappNumber} />
      </div>
    </div>
  );
}
