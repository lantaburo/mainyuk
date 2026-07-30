import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreBySlug } from "@/lib/store";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { TEMPLATE_STYLE, DEFAULT_TEMPLATE, isTemplatePreset } from "@/lib/templates";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/components/storefront/CartProvider";

export async function generateMetadata({
  params,
}: {
  params: { store: string };
}): Promise<Metadata> {
  const store = await getStoreBySlug(params.store);
  if (!store) return {};
  
  const title = store.seoTitle || store.name;
  const description = store.seoDescription || `Selamat datang di ${store.name}`;
  
  return { 
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: store.seoImage ? [{ url: store.seoImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: store.seoImage ? [store.seoImage] : [],
    },
    verification: {
      google: store.googleSiteVerification,
    }
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { store: string };
}) {
  const store = await getStoreBySlug(params.store);
  if (!store) notFound();

  const config = SITE_TYPE_CONFIG[store.siteType];
  const templateStyle =
    TEMPLATE_STYLE[
      store.templateId && isTemplatePreset(store.templateId) ? store.templateId : DEFAULT_TEMPLATE
    ];
  const themeStyle = {
    "--store-primary": store.themeColor,
    "--store-radius": templateStyle.radius,
    "--store-shadow": templateStyle.shadow,
  } as CSSProperties;

  // JSON-LD LocalBusiness Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: store.name,
    image: store.seoImage || store.logoUrl || "",
    description: store.seoDescription || `Selamat datang di ${store.name}`,
    url: `https://${store.slug}.klikweb.id`,
    telephone: store.settings?.whatsappNumber || "",
  };

  const body = (
    <div style={themeStyle} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StorefrontHeader store={store} config={config} />
      <main>{children}</main>
      <StorefrontFooter store={store} />
    </div>
  );

  if (store.siteType !== "storefront") return body;

  return <CartProvider storeSlug={store.slug}>{body}</CartProvider>;
}
