import type { ContactData } from "@/lib/blocks-types";

const CONTACT_ROWS = [
  { key: "address" as const, label: "Alamat", icon: "📍" },
  { key: "phone" as const, label: "Telepon / WhatsApp", icon: "📞" },
  { key: "email" as const, label: "Email", icon: "✉️" },
  { key: "hours" as const, label: "Jam Operasional", icon: "🕐" },
];

export function ContactBlock({
  data,
  whatsappNumber,
}: {
  data: ContactData;
  whatsappNumber?: string | null;
}) {
  const rows = CONTACT_ROWS.map((r) => ({
    ...r,
    value: r.key === "phone" ? (data.phone || whatsappNumber) : data[r.key],
  })).filter((r) => r.value);

  if (rows.length === 0 && !data.map_embed_url) return null;

  return (
    <section className="bg-muted/40 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="sf-animate mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Hubungi Kami</h2>
          <div
            className="mx-auto mt-3 h-1 w-16 rounded-full"
            style={{ background: "var(--store-primary)" }}
          />
        </div>

        <div className={`grid gap-8 ${data.map_embed_url ? "sm:grid-cols-2" : ""}`}>
          {/* Info rows */}
          {rows.length > 0 && (
            <div className="sf-animate sf-delay-1 flex flex-col gap-4">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-start gap-4 rounded-[var(--store-radius)] border bg-white p-5 shadow-[var(--store-shadow)]"
                >
                  <span className="mt-0.5 text-xl">{row.icon}</span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map */}
          {data.map_embed_url && (
            <div className="sf-animate sf-delay-2 overflow-hidden rounded-[var(--store-radius)] border shadow-[var(--store-shadow)]">
              <iframe
                src={data.map_embed_url}
                className="h-80 w-full sm:h-full"
                loading="lazy"
                title="Peta lokasi"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
