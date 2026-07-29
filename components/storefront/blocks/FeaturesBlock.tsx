import type { FeaturesData } from "@/lib/blocks-types";

export function FeaturesBlock({ data }: { data: FeaturesData }) {
  if (!data.items?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      {data.title && <h2 className="mb-6 text-2xl font-semibold">{data.title}</h2>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item, i) => (
          <div key={i}>
            <h3 className="font-medium">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
