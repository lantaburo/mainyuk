import Link from "next/link";
import type { SiteTypeConfig } from "@/lib/site-types";
import { CartButton } from "@/components/storefront/CartButton";

interface StorefrontHeaderProps {
  store: { 
    slug: string; 
    name: string; 
    logoUrl: string | null; 
    siteType: string;
    settings?: {
      useLogo?: boolean;
      headerMenus?: any;
    } | null;
  };
  config: SiteTypeConfig;
}

export function StorefrontHeader({ store, config }: StorefrontHeaderProps) {
  let navItems: { href: string; label: string }[] = [];
  
  const customMenus = Array.isArray(store.settings?.headerMenus) ? store.settings!.headerMenus : [];
  const visibleMenus = customMenus.filter((m: any) => m.isVisible !== false);

  if (visibleMenus.length > 0) {
    navItems = visibleMenus.map((m: any) => ({
      label: m.label,
      href: m.type === "page" ? `/${store.slug}/${m.target}` : (m.target || "#")
    }));
  } else {
    // Default fallback
    if (store.siteType === "storefront")
      navItems.push({ href: `/${store.slug}/produk`, label: "Produk" });
    if (config.pages.some((p) => p.pageType === "about"))
      navItems.push({ href: `/${store.slug}/tentang`, label: "Tentang" });
    if (config.pages.some((p) => p.pageType === "contact"))
      navItems.push({ href: `/${store.slug}/kontak`, label: "Kontak" });
  }

  const useLogo = store.settings?.useLogo ?? true;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={`/${store.slug}`}
          className="flex items-center gap-3 font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          {useLogo && (
            store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-9 w-9 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold text-white shadow-sm"
                style={{ background: "var(--store-primary)" }}
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
            )
          )}
          <span className="text-base">{store.name}</span>
        </Link>

        <div className="flex items-center gap-6">
          {navItems.length > 0 && (
            <nav className="hidden items-center gap-6 sm:flex">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group relative text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  {item.label}
                  <span
                    className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full"
                    style={{ background: "var(--store-primary)" }}
                  />
                </Link>
              ))}
            </nav>
          )}
          {store.siteType === "storefront" && <CartButton storeSlug={store.slug} />}
        </div>
      </div>
    </header>
  );
}
