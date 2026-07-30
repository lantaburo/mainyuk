import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreBySlug } from "@/lib/store";
import { prisma } from "@/lib/prisma";

export default async function StoreArticleIndexPage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const articles = await prisma.article.findMany({
    where: { storeId: store.id, status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Artikel & Blog
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Berita terbaru, tips, dan informasi dari {store.name}.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3">
        {articles.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">Belum ada artikel yang diterbitkan.</p>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl dark:bg-gray-800">
              {article.thumbnail ? (
                <div className="shrink-0">
                  <img className="h-48 w-full object-cover" src={article.thumbnail} alt={article.title} />
                </div>
              ) : (
                <div className="flex h-48 shrink-0 items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <span className="text-gray-400">Tanpa Gambar</span>
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between bg-white p-6 dark:bg-gray-800">
                <div className="flex-1">
                  <Link href={`/${store.slug}/artikel/${article.slug}`} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900 hover:text-[var(--store-primary)] dark:text-white">
                      {article.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-300 line-clamp-3">
                      {article.excerpt || article.content.substring(0, 150) + "..."}
                    </p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={article.publishedAt?.toISOString()}>
                      {article.publishedAt?.toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
