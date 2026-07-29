import type { BannerData } from "@/lib/blocks-types";

export function BannerBlock({ data }: { data: BannerData }) {
  if (!data.image_url) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={data.image_url} alt="" className="h-full w-full object-cover" />
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-[var(--store-radius)] shadow-[var(--store-shadow)]">
        {data.link ? <a href={data.link}>{image}</a> : image}
      </div>
    </section>
  );
}
