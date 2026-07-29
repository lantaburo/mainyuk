import type { ContactData } from "@/lib/blocks-types";

export function ContactBlock({
  data,
  whatsappNumber,
}: {
  data: ContactData;
  whatsappNumber?: string | null;
}) {
  const rows = [
    { label: "Alamat", value: data.address },
    { label: "Telepon / WhatsApp", value: data.phone || whatsappNumber },
    { label: "Email", value: data.email },
    { label: "Jam Operasional", value: data.hours },
  ].filter((row) => row.value);

  if (rows.length === 0 && !data.map_embed_url) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="mb-6 text-2xl font-semibold">Hubungi Kami</h2>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-2 text-sm">
            <dt className="w-40 shrink-0 text-muted-foreground">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {data.map_embed_url && (
        <iframe
          src={data.map_embed_url}
          className="mt-6 h-72 w-full rounded-lg border"
          loading="lazy"
        />
      )}
    </section>
  );
}
