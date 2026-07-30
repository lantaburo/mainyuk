import { notFound } from "next/navigation";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateArticle, deleteArticle } from "@/app/dashboard/artikel/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const session = await requireStoreOwner();

  const article = await prisma.article.findFirst({
    where: { id: params.id, storeId: session.user.storeId },
  });
  if (!article) notFound();

  const updateArticleWithId = updateArticle.bind(null, article.id);
  const deleteArticleWithId = deleteArticle.bind(null, article.id);

  return (
    <div className="max-w-3xl space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Artikel</h1>
          <p className="text-sm text-muted-foreground">{article.title}</p>
        </div>
        <form action={deleteArticleWithId}>
          <Button type="submit" variant="destructive">
            Hapus
          </Button>
        </form>
      </div>

      <form action={updateArticleWithId} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Artikel</Label>
            <Input id="title" name="title" defaultValue={article.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" defaultValue={article.slug} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Ringkasan (Excerpt)</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              defaultValue={article.excerpt ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Thumbnail Artikel</Label>
            <ImageUploadField name="thumbnail" defaultValue={article.thumbnail ?? ""} label="Gambar Thumbnail" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Isi Konten (mendukung format Markdown/HTML sederhana)</Label>
            <Textarea
              id="content"
              name="content"
              rows={15}
              required
              defaultValue={article.content}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={article.status}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="draft">Draft (Belum terbit)</option>
              <option value="published">Publish (Telah terbit)</option>
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
            <Input id="seoTitle" name="seoTitle" defaultValue={article.seoTitle ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Deskripsi Khusus SEO</Label>
            <Textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={article.seoDescription ?? ""} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="w-full">Simpan Perubahan</Button>
        </div>
      </form>
    </div>
  );
}
