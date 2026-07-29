"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SITE_TYPE_CONFIG, type SiteType } from "@/lib/site-types";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  store: { name: string; slug: string; siteType: SiteType };
}

export function DashboardNav({ store }: DashboardNavProps) {
  const pathname = usePathname();
  const config = SITE_TYPE_CONFIG[store.siteType];

  const items = [
    { href: "/dashboard", label: "Ringkasan" },
    ...(config.showProductsMenu ? [{ href: "/dashboard/produk", label: "Produk" }] : []),
    ...(config.showCategoriesMenu ? [{ href: "/dashboard/kategori", label: "Kategori" }] : []),
    ...(store.siteType === "storefront" ? [{ href: "/dashboard/pesanan", label: "Pesanan" }] : []),
    { href: "/dashboard/halaman", label: "Halaman" },
    { href: "/dashboard/generator-ai", label: "Generator AI" },
    { href: "/dashboard/pengaturan", label: "Pengaturan" },
  ];

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r p-4">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground">{config.label}</p>
        <p className="font-medium">{store.name}</p>
        <Link
          href={`/${store.slug}`}
          target="_blank"
          className="text-xs text-muted-foreground hover:underline"
        >
          Lihat situs →
        </Link>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm",
              pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted/50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        size="sm"
        className="mt-6 w-full justify-start"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Keluar
      </Button>
    </aside>
  );
}
