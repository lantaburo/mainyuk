import type { TestimonialData } from "@/lib/blocks-types";

export function TestimonialBlock({ data }: { data: TestimonialData }) {
  if (!data.items?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      {data.title && <h2 className="mb-6 text-2xl font-semibold">{data.title}</h2>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item, i) => (
          <div key={i} className="rounded-[var(--store-radius)] border p-5 shadow-[var(--store-shadow)]">
            <div className="mb-2 text-[var(--store-primary)]">
              {"★".repeat(Math.max(0, Math.min(5, item.rating)))}
              {"☆".repeat(5 - Math.max(0, Math.min(5, item.rating)))}
            </div>
            <p className="text-sm text-muted-foreground">&ldquo;{item.text}&rdquo;</p>
            <p className="mt-3 text-sm font-medium">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
