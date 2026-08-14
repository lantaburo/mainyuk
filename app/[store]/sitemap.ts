import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap({ params }: { params: { store: string } }): Promise<MetadataRoute.Sitemap> {
  const store = await prisma.store.findUnique({
    where: { slug: params.store },
    include: {
      pages: { select: { slug: true, updatedAt: true, pageType: true } },
      products: { where: { status: "published" }, select: { slug: true, updatedAt: true } },
      articles: { where: { status: "published" }, select: { slug: true, updatedAt: true } },
    }
  });

  if (!store) return [];

  const baseUrl = `https://${store.slug}.mainyuk.my.id`;

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: store.updatedAt,
      priority: 1,
      changeFrequency: 'daily',
    },
  ];

  // Tambahkan halaman kustom
  for (const page of store.pages) {
    if (page.pageType !== "home" && page.slug) {
      sitemap.push({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt,
        priority: 0.8,
        changeFrequency: 'weekly',
      });
    }
  }

  // Tambahkan produk
  for (const product of store.products) {
    sitemap.push({
      url: `${baseUrl}/produk/${product.slug}`,
      lastModified: product.updatedAt,
      priority: 0.9,
      changeFrequency: 'daily',
    });
  }

  // Tambahkan artikel
  if (store.articles.length > 0) {
    sitemap.push({
      url: `${baseUrl}/artikel`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: 'daily',
    });

    for (const article of store.articles) {
      sitemap.push({
        url: `${baseUrl}/artikel/${article.slug}`,
        lastModified: article.updatedAt,
        priority: 0.8,
        changeFrequency: 'weekly',
      });
    }
  }

  return sitemap;
}
