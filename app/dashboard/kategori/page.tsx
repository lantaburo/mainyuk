import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "@/app/dashboard/kategori/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function KategoriPage() {
  const session = await requireStoreOwner();
  const categories = await prisma.category.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Kategori</h1>

      <div className="mt-6 space-y-2">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada kategori.</p>
        )}
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
          >
            <span>{category.name}</span>
            <form action={deleteCategory.bind(null, category.id)}>
              <Button type="submit" variant="ghost" size="sm">
                Hapus
              </Button>
            </form>
          </div>
        ))}
      </div>

      <form action={createCategory} className="mt-6 flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Kategori</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required />
        </div>
        <Button type="submit" variant="outline">
          Tambah Kategori
        </Button>
      </form>
    </div>
  );
}
