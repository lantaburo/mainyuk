import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export default async function CheckoutPage({ params }: { params: { store: string } }) {
  const store = await getStoreBySlug(params.store);
  if (!store || store.siteType !== "storefront") notFound();

  const bankAccounts = Array.isArray(store.settings?.bankAccounts)
    ? (store.settings!.bankAccounts as unknown[]).length
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>
      <CheckoutForm
        storeSlug={store.slug}
        flatShippingCost={Number(store.settings?.flatShippingCost ?? 0)}
        midtransAvailable={Boolean(store.settings?.midtransServerKey)}
        qrisAvailable={Boolean(store.settings?.qrisImageUrl)}
        bankTransferAvailable={bankAccounts > 0}
      />
    </div>
  );
}
