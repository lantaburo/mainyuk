import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import AffiliateDashboardClient from "@/components/affiliate/AffiliateDashboardClient";
import { getMyAffiliate } from "@/app/affiliate/actions";

export const metadata = {
  title: "Dashboard Afiliasi - MainYuk",
};

export default async function AffiliateDashboardPage() {
  await requireAuth();
  
  const affiliate = await getMyAffiliate();

  if (!affiliate) {
    redirect("/affiliate/daftar");
  }

  return <AffiliateDashboardClient affiliate={affiliate} />;
}
