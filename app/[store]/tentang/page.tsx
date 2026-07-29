import { notFound } from "next/navigation";
import { getStoreBySlug, getStorePage } from "@/lib/store";
import { BlockRenderer } from "@/components/storefront/blocks/BlockRenderer";
import { parseBlocks } from "@/lib/blocks-types";

export default async function StoreAboutPage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const page = await getStorePage(store.id, "about");
  if (!page) notFound();

  const blocks = parseBlocks(page.blocks);

  return (
    <BlockRenderer
      blocks={blocks}
      storeSlug={store.slug}
      whatsappNumber={store.settings?.whatsappNumber}
    />
  );
}
