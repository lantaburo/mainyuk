import { createArticle } from "@/app/dashboard/artikel/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { Separator } from "@/components/ui/separator";

export default function BaruArticlePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Tulis Artikel Baru</h1>
        <p className="text-sm text-muted-foreground">Buat konten blog untuk optimasi SEO toko Anda.</p>
      </div>

      <form action={createArticle} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Artikel</Label>
            <Input id="title" name="title" required placeholder="Judul artikel Anda..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" required placeholder="judul-artikel-anda" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Ringkasan (Excerpt)</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              placeholder="Ringkasan singkat artikel..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Thumbnail Artikel</Label>
            <ImageUploadField name="thumbnail" label="Gambar Thumbnail" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Isi Konten (mendukung format Markdown/HTML sederhana)</Label>
            <Textarea
              id="content"
              name="content"
              rows={15}
              required
              placeholder="Tulis isi artikel Anda di sini..."
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue="draft"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="draft">Draft (Belum terbit)</option>
              <option value="published">Publish (Langsung terbit)</option>
            </select>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-medium">SEO & Meta (Opsional)</h2>
          <p className="text-xs text-muted-foreground">
            Jika dikosongkan, mesin pencari akan menggunakan Judul dan Ringkasan dari atas.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">Judul Khusus SEO</Label>
            <Input id="seoTitle" name="seoTitle" placeholder="Judul khusus untuk Google..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Deskripsi Khusus SEO</Label>
            <Textarea id="seoDescription" name="seoDescription" rows={2} placeholder="Meta description..." />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="w-full">Simpan Artikel</Button>
        </div>
      </form>
    </div>
  );
}
