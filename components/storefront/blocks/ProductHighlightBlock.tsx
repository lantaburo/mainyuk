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

  const layout = data.layout ?? "default";

  const ImageCol = (
    <div className="sf-animate group aspect-square overflow-hidden rounded-[var(--store-radius)] bg-muted shadow-[var(--store-shadow)] transition-transform duration-500">
      {product.images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.images[0].url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Tanpa gambar
        </div>
      )}
    </div>
  );

  const InfoCol = (
    <div className="sf-animate sf-delay-1 flex flex-col gap-5">
      {data.headline && (
        <span
          className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ background: "var(--store-primary)" }}
        >
          {data.headline}
        </span>
      )}
      <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {product.name}
      </h2>
      <div
        className="inline-flex w-fit items-baseline gap-1 rounded-lg px-4 py-2 text-white"
        style={{ background: "var(--store-primary)" }}
      >
        <span className="text-2xl font-extrabold">{formatRupiah(product.price)}</span>
      </div>
      {product.description && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      )}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-2 inline-flex h-12 w-fit items-center gap-2.5 rounded-[var(--store-radius)] px-7 text-sm font-bold text-white shadow-[var(--store-shadow)] transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{ background: "var(--store-primary)" }}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.073.528 4.017 1.463 5.716L.072 23.928l6.339-1.34A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.012-1.373l-.36-.213-3.761.795.845-3.646-.234-.374A9.77 9.77 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
          </svg>
          Pesan via WhatsApp
        </a>
      )}
    </div>
  );

  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 sm:grid-cols-2">
        {layout === "reversed" ? (
          <>
            {InfoCol}
            {ImageCol}
          </>
        ) : (
          <>
            {ImageCol}
            {InfoCol}
          </>
        )}
      </div>
    </section>
  );
}
