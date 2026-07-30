import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/app/dashboard/produk/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";

export default async function NewProductPage() {
  const session = await requireStoreOwner();
  const categories = await prisma.category.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Tambah Produk</h1>
      <form action={createProduct} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Produk</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (untuk URL)</Label>
          <Input id="slug" name="slug" placeholder="contoh: kaos-polos-hitam" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" name="description" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input id="price" name="price" type="number" min={0} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stok</Label>
            <Input id="stock" name="stock" type="number" min={0} defaultValue={0} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Gambar Produk Utama</Label>
          <ImageUploadField name="imageUrl" label="Gambar Utama" />
        </div>
        {categories.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              name="categoryId"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue="draft"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Publish</option>
          </select>
        </div>
        <Button type="submit">Simpan Produk</Button>
      </form>
    </div>
  );
}
