import Link from "next/link";
import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ArtikelListPage() {
  const session = await requireStoreOwner();

  const articles = await prisma.article.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Artikel / Blog</h1>
        <Button nativeButton={false} render={<Link href="/dashboard/artikel/baru" />}>Tambah Artikel</Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Kelola artikel atau blog untuk meningkatkan SEO dan mendatangkan traffic organik ke toko Anda.
      </p>

      {articles.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Belum ada artikel.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Dilihat Oleh Mesin Pencari</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/artikel/${article.id}`}
                    className="font-medium hover:underline"
                  >
                    {article.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {article.seoTitle ? "Optimasi SEO Khusus" : "Menggunakan Judul Asli"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={article.status === "published" ? "default" : "secondary"}>
                    {article.status === "published" ? "Publish" : "Draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
