"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Wand2,
  Settings,
  LogOut,
  ExternalLink
} from "lucide-react";
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
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    ...(config.showProductsMenu ? [{ href: "/dashboard/produk", label: "Produk", icon: Package }] : []),
    ...(config.showCategoriesMenu ? [{ href: "/dashboard/kategori", label: "Kategori", icon: Tags }] : []),
    ...(store.siteType === "storefront" ? [{ href: "/dashboard/pesanan", label: "Pesanan", icon: ShoppingCart }] : []),
    { href: "/dashboard/ai-generator", label: "AI Website Generator", icon: Wand2 },
    { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">{config.label}</p>
        <p className="font-bold text-gray-900 truncate">{store.name}</p>
        <Link
          href={`/${store.slug}`}
          target="_blank"
          className="group mt-2 inline-flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors"
        >
          Lihat situs <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon 
                className={cn(
                  "h-4 w-4 transition-colors", 
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )} 
              />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 group"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
