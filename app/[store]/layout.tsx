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
  return { title: store.name };
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

  const body = (
    <div style={themeStyle} className="min-h-screen">
      <StorefrontHeader store={store} config={config} />
      <main>{children}</main>
      <StorefrontFooter store={store} />
    </div>
  );

  if (store.siteType !== "storefront") return body;

  return <CartProvider storeSlug={store.slug}>{body}</CartProvider>;
}
