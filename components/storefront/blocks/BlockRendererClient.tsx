"use client";

/**
 * Client-safe block renderer for the Visual Builder.
 * Cannot import server components that call prisma directly.
 * FeaturedProductsBlock and ProductHighlightBlock are replaced
 * with inline placeholders that still look meaningful in the preview.
 */

import type { Block } from "@/lib/blocks-types";
import { HeroBlock } from "./HeroBlock";
import { BannerBlock } from "./BannerBlock";
import { TestimonialBlock } from "./TestimonialBlock";
import { AboutBlock } from "./AboutBlock";
import { FeaturesBlock } from "./FeaturesBlock";
import { CtaBlock } from "./CtaBlock";
import { ContactBlock } from "./ContactBlock";
import { FaqBlock } from "./FaqBlock";
import { BlockWrapper } from "./BlockWrapper";
import { Package } from "lucide-react";

interface BlockRendererClientProps {
  blocks: Block[];
  storeSlug: string;
  whatsappNumber?: string | null;
}

/**
 * Placeholder for product-related blocks that require a DB fetch.
 * Shows a visual hint so the operator knows a product block exists there.
 */
function ProductBlockPlaceholder({ label }: { label: string }) {
  return (
    <section className="py-16 px-4 bg-slate-50 border-y border-dashed border-slate-300">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-3 text-slate-400">
        <Package className="h-10 w-10" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs">(Render produk hanya tersedia di storefront publik)</p>
      </div>
    </section>
  );
}

export function BlockRendererClient({ blocks, whatsappNumber }: BlockRendererClientProps) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((block) => {
        let content = null;
        switch (block.type) {
          case "hero":
            content = <HeroBlock data={block.data} />;
            break;
          case "featured_products":
            content = <ProductBlockPlaceholder label={`Produk Unggulan: ${block.data.title || ""}`} />;
            break;
          case "product_highlight":
            content = <ProductBlockPlaceholder label={`Sorotan Produk: ${block.data.headline || ""}`} />;
            break;
          case "banner":
            content = <BannerBlock data={block.data} />;
            break;
          case "testimonial":
            content = <TestimonialBlock data={block.data} />;
            break;
          case "about":
            content = <AboutBlock data={block.data} />;
            break;
          case "features":
            content = <FeaturesBlock data={block.data} />;
            break;
          case "cta":
            content = <CtaBlock data={block.data} whatsappNumber={whatsappNumber} />;
            break;
          case "contact":
            content = <ContactBlock data={block.data} whatsappNumber={whatsappNumber} />;
            break;
          case "faq":
            content = <FaqBlock data={block.data} />;
            break;
        }
        
        return content ? (
          <BlockWrapper key={block.id} styles={block.style_overrides}>
            {content}
          </BlockWrapper>
        ) : null;
      })}
    </>
  );
}
