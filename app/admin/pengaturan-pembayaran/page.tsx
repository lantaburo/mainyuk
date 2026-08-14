import { getSettings } from "@/app/admin/pengaturan/actions";
import { requireSuperAdmin } from "@/lib/session";
import { PaymentSettingsClient } from "@/components/admin/PaymentSettingsClient";
import { CreditCard } from "lucide-react";

export default async function PengaturanPembayaranPage() {
  await requireSuperAdmin();

  const settings = await getSettings([
    "midtrans_server_key", "midtrans_client_key", "midtrans_sandbox",
    "qris_mode", "qris_static_image", "qris_merchant_id",
    "bank_accounts",
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pengaturan Pembayaran</h1>
          <p className="mt-1 text-sm text-gray-500">Konfigurasi Midtrans, QRIS, dan nomor rekening untuk menerima pembayaran.</p>
        </div>
      </div>

      <PaymentSettingsClient initialSettings={settings} />
    </div>
  );
}
