import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";
import { StoreHtmlRenderer } from "@/components/storefront/StoreHtmlRenderer";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { store: string; pageSlug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.store);
  if (!store) return {};

  const page = await prisma.storePage.findFirst({
    where: { 
      storeId: store.id, 
      pageType: "custom",
      OR: [
        { slug: params.pageSlug },
        { id: params.pageSlug }
      ]
    }
  });
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

export default async function CustomStorePage({ params }: { params: { store: string; pageSlug: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const page = await prisma.storePage.findFirst({
    where: { 
      storeId: store.id, 
      pageType: "custom",
      OR: [
        { slug: params.pageSlug },
        { id: params.pageSlug }
      ]
    }
  });

  if (!page) notFound();

  return <StoreHtmlRenderer html={page.html ?? ""} storeId={store.id} storeSlug={store.slug} />;
}
