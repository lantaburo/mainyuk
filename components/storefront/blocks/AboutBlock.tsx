import type { AboutData } from "@/lib/blocks-types";

export function AboutBlock({ data }: { data: AboutData }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="mb-4 text-2xl font-semibold">{data.title}</h2>
      <p className="whitespace-pre-line text-muted-foreground">{data.content}</p>
    </section>
  );
}
