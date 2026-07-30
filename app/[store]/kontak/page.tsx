import { notFound } from "next/navigation";
import { getStoreBySlug, getStorePage } from "@/lib/store";
import { StoreHtmlRenderer } from "@/components/storefront/StoreHtmlRenderer";

export default async function StoreContactPage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const page = await getStorePage(store.id, "contact");
  if (!page) notFound();

  return <StoreHtmlRenderer html={page.html} storeId={store.id} storeSlug={store.slug} />;
}
