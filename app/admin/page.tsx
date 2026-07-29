import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { updateStoreStatus, deleteStore } from "@/app/admin/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { StoreStatusSelect } from "@/components/admin/StoreStatusSelect";

export default async function AdminPage() {
  const session = await requireAdmin();

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Daftar Tenant</h1>
      <p className="mt-1 text-sm text-muted-foreground">{stores.length} toko terdaftar</p>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Toko</TableHead>
            <TableHead>Jenis Situs</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pemilik</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell>
                <a
                  href={`/${store.slug}`}
                  target="_blank"
                  className="font-medium hover:underline"
                  rel="noreferrer"
                >
                  {store.name}
                </a>
                <div className="text-xs text-muted-foreground">/{store.slug}</div>
              </TableCell>
              <TableCell>{SITE_TYPE_CONFIG[store.siteType].label}</TableCell>
              <TableCell className="capitalize">{store.planType}</TableCell>
              <TableCell>
                <StoreStatusSelect
                  action={updateStoreStatus.bind(null, store.id)}
                  defaultValue={store.status}
                />
              </TableCell>
              <TableCell>
                <div>{store.owner.name}</div>
                <div className="text-xs text-muted-foreground">{store.owner.email}</div>
              </TableCell>
              <TableCell>{store._count.products}</TableCell>
              <TableCell>{store._count.orders}</TableCell>
              <TableCell>{store.createdAt.toLocaleDateString("id-ID")}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/admin/generator-ai/${store.id}`} />}
                  >
                    Generator AI
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/admin/halaman/${store.id}`} />}
                  >
                    Edit Halaman
                  </Button>
                  <ConfirmDeleteButton
                    action={deleteStore.bind(null, store.id)}
                    confirmText={`Hapus toko "${store.name}"? Semua produk, halaman, dan datanya akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
