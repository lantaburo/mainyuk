import { notFound } from "next/navigation";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  updateProduct,
  deleteProduct,
  addVariant,
  deleteVariant,
  addImage,
  deleteImage,
} from "@/app/dashboard/produk/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/format";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireStoreOwner();

  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id: params.id, storeId: session.user.storeId },
      include: { variants: true, images: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({ where: { storeId: session.user.storeId }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);
  const addVariantWithId = addVariant.bind(null, product.id);
  const addImageWithId = addImage.bind(null, product.id);
  const deleteProductWithId = deleteProduct.bind(null, product.id);

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-muted-foreground">Kelola detail produk</p>
      </div>

      <form action={updateProductWithId} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Produk</Label>
          <Input id="name" name="name" defaultValue={product.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product.slug} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              defaultValue={product.price.toString()}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stok</Label>
            <Input id="stock" name="stock" type="number" min={0} defaultValue={product.stock} required />
          </div>
        </div>
        {categories.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product.categoryId ?? ""}
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
            defaultValue={product.status}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Publish</option>
          </select>
        </div>
        <Button type="submit">Simpan Perubahan</Button>
      </form>

      <Separator />

      <div>
        <h2 className="text-lg font-medium">Varian</h2>
        <p className="text-sm text-muted-foreground">
          Contoh: ukuran, warna. Kosongkan harga jika mengikuti harga dasar.
        </p>
        <div className="mt-4 space-y-2">
          {product.variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>
                {variant.name}
                {variant.priceOverride
                  ? ` · ${formatRupiah(variant.priceOverride)}`
                  : ""}{" "}
                · stok {variant.stock}
              </span>
              <form action={deleteVariant.bind(null, variant.id, product.id)}>
                <Button type="submit" variant="ghost" size="sm">
                  Hapus
                </Button>
              </form>
            </div>
          ))}
        </div>
        <form action={addVariantWithId} className="mt-4 flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="variantName">Nama Varian</Label>
            <Input id="variantName" name="name" className="w-40" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="variantPrice">Harga Khusus</Label>
            <Input id="variantPrice" name="priceOverride" type="number" min={0} className="w-32" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="variantStock">Stok</Label>
            <Input
              id="variantStock"
              name="stock"
              type="number"
              min={0}
              defaultValue={0}
              className="w-24"
              required
            />
          </div>
          <Button type="submit" variant="outline">
            Tambah Varian
          </Button>
        </form>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-medium">Gambar</h2>
        <p className="text-sm text-muted-foreground">
          Tempel URL gambar produk (upload langsung menyusul).
        </p>
        <div className="mt-4 space-y-2">
          {product.images.map((image) => (
            <div
              key={image.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span className="truncate">{image.url}</span>
              <form action={deleteImage.bind(null, image.id, product.id)}>
                <Button type="submit" variant="ghost" size="sm">
                  Hapus
                </Button>
              </form>
            </div>
          ))}
        </div>
        <form action={addImageWithId} className="mt-4 flex flex-wrap items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label>Upload Gambar</Label>
            <ImageUploadField name="url" label="Pilih Gambar" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageOrder">Urutan</Label>
            <Input id="imageOrder" name="order" type="number" min={0} defaultValue={0} className="w-20" />
          </div>
          <Button type="submit" variant="outline">
            Tambah Gambar
          </Button>
        </form>
      </div>

      <Separator />

      <form action={deleteProductWithId}>
        <Button type="submit" variant="destructive">
          Hapus Produk
        </Button>
      </form>
    </div>
  );
}
