import { prisma } from "@/lib/prisma";
import type { ProductHighlightData } from "@/lib/blocks-types";
import { formatRupiah, toWhatsAppLink } from "@/lib/format";

export async function ProductHighlightBlock({
  data,
  whatsappNumber,
}: {
  data: ProductHighlightData;
  whatsappNumber?: string | null;
}) {
  if (!data.product_id) return null;

  const product = await prisma.product.findUnique({
    where: { id: data.product_id },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!product) return null;

  const waLink = whatsappNumber
    ? toWhatsAppLink(whatsappNumber, `Halo, saya mau pesan ${product.name}`)
    : null;

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Tanpa gambar
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center">
        {data.headline && (
          <p className="text-sm font-medium text-[var(--store-primary)]">{data.headline}</p>
        )}
        <h2 className="mt-1 text-2xl font-semibold">{product.name}</h2>
        <p className="mt-2 text-xl font-bold">{formatRupiah(product.price)}</p>
        {product.description && (
          <p className="mt-4 whitespace-pre-line text-muted-foreground">{product.description}</p>
        )}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 w-fit items-center rounded-lg bg-[var(--store-primary)] px-6 text-sm font-medium text-white shadow"
          >
            Pesan via WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
