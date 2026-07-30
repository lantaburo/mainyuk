import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { store: string; slug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.store);
  if (!store) return {};

  const article = await prisma.article.findUnique({
    where: { storeId_slug: { storeId: store.id, slug: params.slug } },
  });
  if (!article || article.status !== "published") return {};

  const title = article.seoTitle || `${article.title} - ${store.name}`;
  const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.thumbnail ? [{ url: article.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.thumbnail ? [article.thumbnail] : [],
    },
  };
}

export default async function StoreArticleDetailPage({ params }: { params: { store: string; slug: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const article = await prisma.article.findUnique({
    where: { storeId_slug: { storeId: store.id, slug: params.slug } },
  });
  
  if (!article || article.status !== "published") notFound();

  // JSON-LD untuk artikel
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    image: article.thumbnail ? [article.thumbnail] : [],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: store.name,
      url: `https://${store.slug}.klikweb.id`,
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mb-8">
        <Link href={`/${store.slug}/artikel`} className="inline-flex items-center text-sm font-medium text-[var(--store-primary)] hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali ke Blog
        </Link>
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <time dateTime={article.publishedAt?.toISOString()}>
            {article.publishedAt?.toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>•</span>
          <span>{store.name}</span>
        </div>
      </header>

      {article.thumbnail && (
        <div className="mb-12 overflow-hidden rounded-2xl shadow-xl">
          <img src={article.thumbnail} alt={article.title} className="w-full object-cover max-h-[500px]" />
        </div>
      )}

      {/* Konten artikel */}
      <div 
        className="prose prose-lg mx-auto prose-blue dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
      />
    </article>
  );
}
