import type { Block } from "@/lib/blocks-types";
import { HeroBlock } from "./HeroBlock";
import { FeaturedProductsBlock } from "./FeaturedProductsBlock";
import { BannerBlock } from "./BannerBlock";
import { TestimonialBlock } from "./TestimonialBlock";
import { AboutBlock } from "./AboutBlock";
import { FeaturesBlock } from "./FeaturesBlock";
import { CtaBlock } from "./CtaBlock";
import { ContactBlock } from "./ContactBlock";
import { FaqBlock } from "./FaqBlock";
import { ProductHighlightBlock } from "./ProductHighlightBlock";

interface BlockRendererProps {
  blocks: Block[];
  storeSlug: string;
  whatsappNumber?: string | null;
}

export function BlockRenderer({ blocks, storeSlug, whatsappNumber }: BlockRendererProps) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroBlock key={block.id} data={block.data} />;
          case "featured_products":
            return (
              <FeaturedProductsBlock key={block.id} data={block.data} storeSlug={storeSlug} />
            );
          case "banner":
            return <BannerBlock key={block.id} data={block.data} />;
          case "testimonial":
            return <TestimonialBlock key={block.id} data={block.data} />;
          case "about":
            return <AboutBlock key={block.id} data={block.data} />;
          case "features":
            return <FeaturesBlock key={block.id} data={block.data} />;
          case "cta":
            return <CtaBlock key={block.id} data={block.data} whatsappNumber={whatsappNumber} />;
          case "contact":
            return (
              <ContactBlock key={block.id} data={block.data} whatsappNumber={whatsappNumber} />
            );
          case "faq":
            return <FaqBlock key={block.id} data={block.data} />;
          case "product_highlight":
            return (
              <ProductHighlightBlock
                key={block.id}
                data={block.data}
                whatsappNumber={whatsappNumber}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
