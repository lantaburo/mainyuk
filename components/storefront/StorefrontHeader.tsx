import Link from "next/link";
import type { SiteTypeConfig } from "@/lib/site-types";
import { CartButton } from "@/components/storefront/CartButton";

interface StorefrontHeaderProps {
  store: { slug: string; name: string; logoUrl: string | null; siteType: string };
  config: SiteTypeConfig;
}

export function StorefrontHeader({ store, config }: StorefrontHeaderProps) {
  const navItems: { href: string; label: string }[] = [];
  if (store.siteType === "storefront")
    navItems.push({ href: `/${store.slug}/produk`, label: "Produk" });
  if (config.pages.some((p) => p.pageType === "about"))
    navItems.push({ href: `/${store.slug}/tentang`, label: "Tentang" });
  if (config.pages.some((p) => p.pageType === "contact"))
    navItems.push({ href: `/${store.slug}/kontak`, label: "Kontak" });

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href={`/${store.slug}`} className="flex items-center gap-2 font-semibold">
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded object-cover" />
        ) : null}
        {store.name}
      </Link>
      <div className="flex items-center gap-5">
        {navItems.length > 0 && (
          <nav className="flex items-center gap-5 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        {store.siteType === "storefront" && <CartButton storeSlug={store.slug} />}
      </div>
    </header>
  );
}
