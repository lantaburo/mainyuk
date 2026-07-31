import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  updateStoreProfile,
  updateStoreSettings,
  updateBankAccounts,
  updatePaymentSettings,
  updateWhatsAppApiSettings,
  updateStoreSEO,
} from "@/app/dashboard/pengaturan/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { SITE_TYPE_CONFIG, SITE_TYPES } from "@/lib/site-types";
import { TEMPLATE_PRESETS, TEMPLATE_STYLE, DEFAULT_TEMPLATE } from "@/lib/templates";
import { BankAccountsEditor } from "@/components/dashboard/BankAccountsEditor";
import { MenuManager, type MenuItemType } from "@/components/dashboard/MenuManager";
import { updateBrandingSettings } from "@/app/dashboard/pengaturan/actions";

export default async function PengaturanPage() {
  const session = await requireStoreOwner();
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: session.user.storeId },
    include: { settings: true },
  });

  const bankAccounts = Array.isArray(store.settings?.bankAccounts)
    ? (store.settings!.bankAccounts as unknown as {
        bank: string;
        accountNumber: string;
        accountName: string;
      }[])
    : [];

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Pengaturan Toko</h1>
        <p className="text-sm text-muted-foreground">klikweb.id/{store.slug}</p>
      </div>

      <form action={updateStoreProfile} className="space-y-4">
        <h2 className="text-lg font-medium">Profil</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Toko</Label>
          <Input id="name" name="name" defaultValue={store.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="siteType">Jenis Situs</Label>
          <select
            id="siteType"
            name="siteType"
            defaultValue={store.siteType}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {SITE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SITE_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="templateId">Preset Tampilan</Label>
          <select
            id="templateId"
            name="templateId"
            defaultValue={store.templateId ?? DEFAULT_TEMPLATE}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {TEMPLATE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {TEMPLATE_STYLE[preset].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="themeColor">Warna Tema</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="themeColor"
              name="themeColor"
              defaultValue={store.themeColor}
              className="h-8 w-12 rounded border"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>URL Logo</Label>
          <ImageUploadField name="logoUrl" defaultValue={store.logoUrl ?? ""} label="Logo" />
        </div>
        <div className="space-y-1.5">
          <Label>URL Banner</Label>
          <ImageUploadField name="bannerUrl" defaultValue={store.bannerUrl ?? ""} label="Banner" />
        </div>
        <Button type="submit">Simpan Profil</Button>
      </form>

      <Separator />

      <form action={updateBrandingSettings} className="space-y-4">
        <h2 className="text-lg font-medium">Navigasi & Branding (Header)</h2>
        <p className="text-sm text-muted-foreground">
          Atur apakah ingin menampilkan menu atas (header), logo, dan favicon pada situs.
        </p>

        <div className="space-y-4 rounded-lg border p-4 bg-white shadow-sm">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="useGlobalHeader"
              defaultChecked={store.settings?.useGlobalHeader ?? true}
            />
            Tampilkan Header Menu (Navigasi Atas)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="useLogo"
              defaultChecked={store.settings?.useLogo ?? true}
            />
            Tampilkan Logo di Header
          </label>
          
          <Separator className="my-2" />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Favicon (Ikon Tab Browser)</Label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="useFavicon"
                  defaultChecked={store.settings?.useFavicon ?? true}
                />
                Aktifkan
              </label>
            </div>
            <ImageUploadField name="faviconUrl" defaultValue={store.faviconUrl ?? ""} label="Favicon" />
          </div>
        </div>
        
        <Button type="submit">Simpan Branding Header</Button>
      </form>

      <Separator />

      <div>
        <h2 className="text-lg font-medium">Manajemen Menu Halaman</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Buat halaman baru atau tautan khusus dan urutkan sesuai keinginan.
        </p>
        <MenuManager 
          storeId={store.id} 
          initialMenus={(store.settings?.headerMenus as MenuItemType[]) || []} 
        />
      </div>

      <Separator />

      <form action={updateStoreSettings} className="space-y-4">
        <h2 className="text-lg font-medium">Kontak & Pengiriman</h2>
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            placeholder="08123456789"
            defaultValue={store.settings?.whatsappNumber ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="shippingOriginCity">Kota Asal Kirim</Label>
            <Input
              id="shippingOriginCity"
              name="shippingOriginCity"
              defaultValue={store.settings?.shippingOriginCity ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shippingOriginProvince">Provinsi Asal Kirim</Label>
            <Input
              id="shippingOriginProvince"
              name="shippingOriginProvince"
              defaultValue={store.settings?.shippingOriginProvince ?? ""}
            />
          </div>
        </div>
        <Button type="submit">Simpan Kontak & Pengiriman</Button>
      </form>

      <Separator />

      <div>
        <h2 className="text-lg font-medium">Rekening Bank</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Ditampilkan ke pembeli saat transfer manual.
        </p>
        <BankAccountsEditor initial={bankAccounts} action={updateBankAccounts} />
      </div>

      {store.siteType === "storefront" && (
        <>
          <Separator />

          <form action={updateWhatsAppApiSettings} className="space-y-4">
            <h2 className="text-lg font-medium">API WhatsApp (Notifikasi Otomatis)</h2>
            <p className="text-sm text-muted-foreground">
              Kalau diisi, pembeli & kamu otomatis dapat WA saat ada pesanan baru dan saat
              pembayaran dikonfirmasi. Isi sesuai API WhatsApp yang kamu pakai (URL endpoint + API
              Key). Kosongkan kalau belum mau pakai fitur ini.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="whatsappApiUrl">URL API</Label>
              <Input
                id="whatsappApiUrl"
                name="whatsappApiUrl"
                type="url"
                placeholder="https://api.contoh-wa.com/send"
                defaultValue={store.settings?.whatsappApiUrl ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="whatsappApiKey">API Key</Label>
                {store.settings?.whatsappApiKey && <Badge variant="secondary">Terisi</Badge>}
              </div>
              <Input
                id="whatsappApiKey"
                name="whatsappApiKey"
                type="password"
                placeholder={store.settings?.whatsappApiKey ? "Biarkan kosong agar tidak diubah" : ""}
              />
            </div>
            <details className="rounded-lg border p-3 text-sm">
              <summary className="cursor-pointer font-medium">Pengaturan Lanjutan</summary>
              <div className="mt-3 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Default-nya sudah cocok untuk kebanyakan API WhatsApp (header{" "}
                  <code>Authorization</code>, field <code>target</code> &amp; <code>message</code>).
                  Ubah kalau API-mu pakai bentuk lain.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappApiKeyHeader">Nama Header Auth</Label>
                    <Input
                      id="whatsappApiKeyHeader"
                      name="whatsappApiKeyHeader"
                      defaultValue={store.settings?.whatsappApiKeyHeader ?? "Authorization"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappApiKeyPrefix">Prefix Header (opsional)</Label>
                    <Input
                      id="whatsappApiKeyPrefix"
                      name="whatsappApiKeyPrefix"
                      placeholder="mis. Bearer "
                      defaultValue={store.settings?.whatsappApiKeyPrefix ?? ""}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappTargetField">Nama Field Nomor Tujuan</Label>
                    <Input
                      id="whatsappTargetField"
                      name="whatsappTargetField"
                      defaultValue={store.settings?.whatsappTargetField ?? "target"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappMessageField">Nama Field Isi Pesan</Label>
                    <Input
                      id="whatsappMessageField"
                      name="whatsappMessageField"
                      defaultValue={store.settings?.whatsappMessageField ?? "message"}
                    />
                  </div>
                </div>
              </div>
            </details>
            <Button type="submit">Simpan API WhatsApp</Button>
          </form>

          <Separator />

          <form action={updatePaymentSettings} className="space-y-4">
            <h2 className="text-lg font-medium">Pembayaran & Ongkir</h2>
            <p className="text-sm text-muted-foreground">
              Metode bayar yang muncul ke pembeli mengikuti yang terisi di sini: Midtrans aktif
              kalau Server Key &amp; Client Key terisi, QRIS aktif kalau gambar QRIS terisi,
              Transfer Bank aktif kalau ada rekening di atas.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="flatShippingCost">Ongkos Kirim Flat (Rp)</Label>
              <Input
                id="flatShippingCost"
                name="flatShippingCost"
                type="number"
                min={0}
                defaultValue={store.settings?.flatShippingCost?.toString() ?? "0"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>URL Gambar QRIS</Label>
              <ImageUploadField name="qrisImageUrl" defaultValue={store.settings?.qrisImageUrl ?? ""} label="QRIS" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="midtransServerKey">Midtrans Server Key</Label>
                {store.settings?.midtransServerKey && <Badge variant="secondary">Terisi</Badge>}
              </div>
              <Input
                id="midtransServerKey"
                name="midtransServerKey"
                type="password"
                placeholder={
                  store.settings?.midtransServerKey ? "Biarkan kosong agar tidak diubah" : "SB-Mid-server-..."
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="midtransClientKey">Midtrans Client Key</Label>
              <Input
                id="midtransClientKey"
                name="midtransClientKey"
                defaultValue={store.settings?.midtransClientKey ?? ""}
                placeholder="SB-Mid-client-..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="midtransIsProduction"
                defaultChecked={store.settings?.midtransIsProduction ?? false}
              />
              Mode Produksi (bukan sandbox)
            </label>
            <Button type="submit">Simpan Pembayaran &amp; Ongkir</Button>
          </form>

          <Separator />

          <form action={updateStoreSEO} className="space-y-4">
            <h2 className="text-lg font-medium">Pengaturan SEO (Search Engine)</h2>
            <p className="text-sm text-muted-foreground">
              Tentukan bagaimana toko Anda tampil di hasil pencarian Google dan saat link di-share (WhatsApp/Medsos).
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="seoTitle">Meta Title (Judul SEO)</Label>
              <Input
                id="seoTitle"
                name="seoTitle"
                placeholder="mis. Toko Kopi Enak - Biji Kopi Premium"
                defaultValue={store.seoTitle ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <Input
                id="seoDescription"
                name="seoDescription"
                placeholder="mis. Dapatkan biji kopi premium dari petani lokal terbaik..."
                defaultValue={store.seoDescription ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="googleSiteVerification">Google Site Verification (Opsional)</Label>
              <Input
                id="googleSiteVerification"
                name="googleSiteVerification"
                placeholder="mis. 1234567890abcdef"
                defaultValue={store.googleSiteVerification ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail Share (OpenGraph Image)</Label>
              <ImageUploadField name="seoImage" defaultValue={store.seoImage ?? ""} label="Thumbnail SEO" />
            </div>
            <Button type="submit">Simpan Pengaturan SEO</Button>
          </form>
        </>
      )}
    </div>
  );
}
