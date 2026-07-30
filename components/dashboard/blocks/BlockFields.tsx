"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaUploadField } from "@/components/dashboard/MediaUploadField";
import type {
  Block,
  FeatureItem,
  FaqItem,
  TestimonialItem,
} from "@/lib/blocks-types";

interface ProductOption {
  id: string;
  name: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export function BlockFields({
  block,
  products,
  onChange,
  storeId,
}: {
  block: Block;
  products: ProductOption[];
  onChange: (data: Block["data"]) => void;
  storeId?: string;
}) {
  switch (block.type) {
    case "hero": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Judul">
            <Input value={d.title} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <Field label="Subjudul">
            <Input
              value={d.subtitle ?? ""}
              onChange={(e) => onChange({ ...d, subtitle: e.target.value })}
            />
          </Field>
          <Field label="Media Latar (Gambar/Video) (opsional)">
            <MediaUploadField
              label="Media Latar"
              value={d.image_url ?? ""}
              onChange={(url) => onChange({ ...d, image_url: url })}
              storeId={storeId}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teks Tombol">
              <Input
                value={d.cta_text ?? ""}
                onChange={(e) => onChange({ ...d, cta_text: e.target.value })}
              />
            </Field>
            <Field label="Link Tombol">
              <Input
                value={d.cta_link ?? ""}
                onChange={(e) => onChange({ ...d, cta_link: e.target.value })}
              />
            </Field>
          </div>
        </div>
      );
    }
    case "about": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Judul">
            <Input value={d.title} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <Field label="Isi">
            <Textarea
              rows={4}
              value={d.content}
              onChange={(e) => onChange({ ...d, content: e.target.value })}
            />
          </Field>
        </div>
      );
    }
    case "banner": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Media Banner (Gambar/Video)">
            <MediaUploadField
              label="Media Banner"
              value={d.image_url ?? ""}
              onChange={(url) => onChange({ ...d, image_url: url })}
              storeId={storeId}
            />
          </Field>
          <Field label="Link (opsional)">
            <Input value={d.link ?? ""} onChange={(e) => onChange({ ...d, link: e.target.value })} />
          </Field>
        </div>
      );
    }
    case "cta": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Judul">
            <Input value={d.title} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <Field label="Subjudul">
            <Input
              value={d.subtitle ?? ""}
              onChange={(e) => onChange({ ...d, subtitle: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teks Tombol">
              <Input
                value={d.button_text}
                onChange={(e) => onChange({ ...d, button_text: e.target.value })}
              />
            </Field>
            <Field label="Link Tombol (# = tombol WhatsApp otomatis)">
              <Input
                value={d.button_link}
                onChange={(e) => onChange({ ...d, button_link: e.target.value })}
              />
            </Field>
          </div>
        </div>
      );
    }
    case "contact": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Alamat">
            <Input
              value={d.address ?? ""}
              onChange={(e) => onChange({ ...d, address: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telepon">
              <Input value={d.phone ?? ""} onChange={(e) => onChange({ ...d, phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={d.email ?? ""} onChange={(e) => onChange({ ...d, email: e.target.value })} />
            </Field>
          </div>
          <Field label="Jam Operasional">
            <Input value={d.hours ?? ""} onChange={(e) => onChange({ ...d, hours: e.target.value })} />
          </Field>
          <Field label="URL Peta (embed)">
            <Input
              value={d.map_embed_url ?? ""}
              onChange={(e) => onChange({ ...d, map_embed_url: e.target.value })}
            />
          </Field>
        </div>
      );
    }
    case "product_highlight": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Produk">
            <select
              value={d.product_id}
              onChange={(e) => onChange({ ...d, product_id: e.target.value })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Pilih produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Headline (opsional)">
            <Input
              value={d.headline ?? ""}
              onChange={(e) => onChange({ ...d, headline: e.target.value })}
            />
          </Field>
        </div>
      );
    }
    case "featured_products": {
      const d = block.data;
      return (
        <div className="space-y-3">
          <Field label="Judul">
            <Input value={d.title} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <Field label="Layout">
            <select
              value={d.layout}
              onChange={(e) => onChange({ ...d, layout: e.target.value as typeof d.layout })}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="grid-2">2 kolom</option>
              <option value="grid-3">3 kolom</option>
              <option value="grid-4">4 kolom</option>
            </select>
          </Field>
          <Field label="Produk (kosongkan untuk otomatis tampilkan terbaru)">
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
              {products.length === 0 && (
                <p className="text-xs text-muted-foreground">Belum ada produk.</p>
              )}
              {products.map((p) => {
                const checked = d.product_ids.includes(p.id);
                return (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...d.product_ids, p.id]
                          : d.product_ids.filter((id) => id !== p.id);
                        onChange({ ...d, product_ids: ids });
                      }}
                    />
                    {p.name}
                  </label>
                );
              })}
            </div>
          </Field>
        </div>
      );
    }
    case "features": {
      const d = block.data;
      const update = (items: FeatureItem[]) => {
        onChange({ ...d, items });
      };
      return (
        <div className="space-y-3">
          <Field label="Judul Seksi (opsional)">
            <Input value={d.title ?? ""} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <div className="space-y-2">
            {d.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Judul"
                  value={item.title}
                  onChange={(e) =>
                    update(d.items.map((it, idx) => (idx === i ? { ...it, title: e.target.value } : it)))
                  }
                />
                <Input
                  placeholder="Deskripsi"
                  value={item.description}
                  onChange={(e) =>
                    update(
                      d.items.map((it, idx) => (idx === i ? { ...it, description: e.target.value } : it))
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update(d.items.filter((_, idx) => idx !== i))}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update([...d.items, { title: "", description: "" }])}
          >
            + Tambah Item
          </Button>
        </div>
      );
    }
    case "faq": {
      const d = block.data;
      const update = (items: FaqItem[]) => {
        onChange({ ...d, items });
      };
      return (
        <div className="space-y-3">
          <Field label="Judul Seksi (opsional)">
            <Input value={d.title ?? ""} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <div className="space-y-2">
            {d.items.map((item, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Pertanyaan"
                    value={item.question}
                    onChange={(e) =>
                      update(
                        d.items.map((it, idx) => (idx === i ? { ...it, question: e.target.value } : it))
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => update(d.items.filter((_, idx) => idx !== i))}
                  >
                    Hapus
                  </Button>
                </div>
                <Textarea
                  placeholder="Jawaban"
                  rows={2}
                  value={item.answer}
                  onChange={(e) =>
                    update(d.items.map((it, idx) => (idx === i ? { ...it, answer: e.target.value } : it)))
                  }
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update([...d.items, { question: "", answer: "" }])}
          >
            + Tambah Pertanyaan
          </Button>
        </div>
      );
    }
    case "testimonial": {
      const d = block.data;
      const update = (items: TestimonialItem[]) => {
        onChange({ ...d, items });
      };
      return (
        <div className="space-y-3">
          <Field label="Judul Seksi (opsional)">
            <Input value={d.title ?? ""} onChange={(e) => onChange({ ...d, title: e.target.value })} />
          </Field>
          <div className="space-y-2">
            {d.items.map((item, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <div className="grid grid-cols-[1fr_80px_auto] gap-2">
                  <Input
                    placeholder="Nama"
                    value={item.name}
                    onChange={(e) =>
                      update(d.items.map((it, idx) => (idx === i ? { ...it, name: e.target.value } : it)))
                    }
                  />
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    placeholder="Rating"
                    value={item.rating}
                    onChange={(e) =>
                      update(
                        d.items.map((it, idx) =>
                          idx === i ? { ...it, rating: Number(e.target.value) } : it
                        )
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => update(d.items.filter((_, idx) => idx !== i))}
                  >
                    Hapus
                  </Button>
                </div>
                <Textarea
                  placeholder="Isi testimoni"
                  rows={2}
                  value={item.text}
                  onChange={(e) =>
                    update(d.items.map((it, idx) => (idx === i ? { ...it, text: e.target.value } : it)))
                  }
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update([...d.items, { name: "", text: "", rating: 5 }])}
          >
            + Tambah Testimoni
          </Button>
        </div>
      );
    }
    default:
      return null;
  }
}
