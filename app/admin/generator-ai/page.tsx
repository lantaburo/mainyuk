import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2 } from "lucide-react";

export default async function AdminGeneratorAiIndexPage() {
  await requireAdmin();

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Generator AI (Operator Mode)</h1>
        <p className="mt-2 text-sm text-gray-500">
          Pilih tenant untuk di-generate halamannya menggunakan AI. Anda dapat mem-preview dan mengedit hasil sebelum publish.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Toko</TableHead>
              <TableHead>Tipe Situs</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const config = SITE_TYPE_CONFIG[store.siteType];
              return (
                <TableRow key={store.id} className="group">
                  <TableCell>
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {store.name}
                      </span>
                      <div className="text-sm text-gray-500">{store.slug}.klikweb.id</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-gray-200">
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{store.owner.name}</div>
                    <div className="text-xs text-gray-500">{store.owner.email}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      render={<Link href={`/builder/${store.id}`} />}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate AI
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
