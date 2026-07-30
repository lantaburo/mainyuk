import { notFound } from "next/navigation";
import { getStoreBySlug, getStorePage } from "@/lib/store";
import { StoreHtmlRenderer } from "@/components/storefront/StoreHtmlRenderer";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { store: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.store);
  if (!store) return {};

  const page = await getStorePage(store.id, "home");
  if (!page) return {};

  const title = page.seoTitle || page.title;
  const description = page.seoDescription;

  return {
    title: title ? title : undefined,
    description: description ? description : undefined,
    openGraph: {
      images: page.seoImage ? [{ url: page.seoImage }] : undefined,
    }
  };
}

export default async function StoreHomePage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const page = await getStorePage(store.id, "home");

  return <StoreHtmlRenderer html={page?.html ?? ""} storeId={store.id} storeSlug={store.slug} />;
}
