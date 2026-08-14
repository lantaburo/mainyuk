import { renderToStaticMarkup } from "react-dom/server";
import type { Block } from "@/lib/blocks-types";
import { HeroBlock } from "@/components/storefront/blocks/HeroBlock";
import { BannerBlock } from "@/components/storefront/blocks/BannerBlock";
import { TestimonialBlock } from "@/components/storefront/blocks/TestimonialBlock";
import { AboutBlock } from "@/components/storefront/blocks/AboutBlock";
import { FeaturesBlock } from "@/components/storefront/blocks/FeaturesBlock";
import { CtaBlock } from "@/components/storefront/blocks/CtaBlock";
import { ContactBlock } from "@/components/storefront/blocks/ContactBlock";
import { FaqBlock } from "@/components/storefront/blocks/FaqBlock";
import { BlockWrapper } from "@/components/storefront/blocks/BlockWrapper";

const PRODUCT_WIDGET = '<div data-mainyuk-widget="featured-products"></div>';

/**
 * Statically renders fixed-block JSON into an HTML string for the new
 * StorePage.html column. Used both for the one-time migration of existing
 * block-based pages and for seeding a reasonable default page at signup
 * (before the owner runs the AI generator). featured_products/product_highlight
 * can't be statically rendered (they query the DB live) — they become a
 * data-mainyuk-widget marker, substituted at render time (see
 * lib/render-dynamic-widgets.tsx).
 */
export function renderBlocksToHtml(blocks: Block[], whatsappNumber?: string | null): string {
  return blocks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      if (block.type === "featured_products" || block.type === "product_highlight") {
        return PRODUCT_WIDGET;
      }

      let content: React.ReactNode = null;
      switch (block.type) {
        case "hero":
          content = <HeroBlock data={block.data} />;
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
      if (!content) return "";
      return renderToStaticMarkup(
        <BlockWrapper styles={block.style_overrides}>{content}</BlockWrapper>
      );
    })
    .join("\n");
}
