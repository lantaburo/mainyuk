import { requireStoreOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  updateStoreProfile,
  updateStoreSettings,
  updateBankAccounts,
  updatePaymentSettings,
  updateWhatsAppApiSettings,
  updateStoreSEO,
  updateBrandingSettings,
} from "@/app/dashboard/pengaturan/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { SITE_TYPE_CONFIG, SITE_TYPES } from "@/lib/site-types";
import { TEMPLATE_PRESETS, TEMPLATE_STYLE, DEFAULT_TEMPLATE } from "@/lib/templates";
import { BankAccountsEditor } from "@/components/dashboard/BankAccountsEditor";
import { MenuManager, type MenuItemType } from "@/components/dashboard/MenuManager";

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
    <div className="max-w-4xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Toko</h1>
        <p className="text-muted-foreground mt-2">
          Kelola profil, tampilan, pengaturan pembayaran, dan integrasi untuk mainyuk.my.id/{store.slug}
        </p>
      </div>

      <Tabs defaultValue="umum" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex w-fit md:w-full min-w-max">
            <TabsTrigger className="flex-1" value="umum">Umum & SEO</TabsTrigger>
            <TabsTrigger className="flex-1" value="tampilan">Tampilan & Menu</TabsTrigger>
            <TabsTrigger className="flex-1" value="kontak">Kontak & Kirim</TabsTrigger>
            <TabsTrigger className="flex-1" value="pembayaran">Pembayaran</TabsTrigger>
            {store.siteType === "storefront" && <TabsTrigger className="flex-1" value="notifikasi">Notifikasi WA</TabsTrigger>}
          </TabsList>
        </div>

        {/* ======================= TAB 1: UMUM & SEO ======================= */}
        <TabsContent value="umum" className="space-y-6 mt-4">
          <Card>
            <form action={updateStoreProfile}>
              <CardHeader>
                <CardTitle>Profil Dasar</CardTitle>
                <CardDescription>Ubah nama, jenis, dan warna tema toko Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Toko</Label>
                  <Input id="name" name="name" defaultValue={store.name} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="siteType">Jenis Situs</Label>
                    <select
                      id="siteType"
                      name="siteType"
                      defaultValue={store.siteType}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {TEMPLATE_PRESETS.map((preset) => (
                        <option key={preset} value={preset}>
                          {TEMPLATE_STYLE[preset].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="themeColor">Warna Tema Utama</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="themeColor"
                      name="themeColor"
                      defaultValue={store.themeColor}
                      className="h-10 w-16 cursor-pointer rounded border p-1"
                    />
                    <span className="text-sm text-muted-foreground">Warna ini akan mendominasi tombol dan aksen visual.</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1.5">
                    <Label>URL Logo Utama</Label>
                    <ImageUploadField name="logoUrl" defaultValue={store.logoUrl ?? ""} label="Logo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>URL Banner</Label>
                    <ImageUploadField name="bannerUrl" defaultValue={store.bannerUrl ?? ""} label="Banner" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                <Button type="submit">Simpan Profil</Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <form action={updateStoreSEO}>
              <CardHeader>
                <CardTitle>Pengaturan SEO & Search Engine</CardTitle>
                <CardDescription>Tentukan bagaimana toko Anda tampil di hasil pencarian Google dan saat di-share di medsos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                <Button type="submit">Simpan SEO</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ======================= TAB 2: TAMPILAN & MENU ======================= */}
        <TabsContent value="tampilan" className="space-y-6 mt-4">
          <Card>
            <form action={updateBrandingSettings}>
              <CardHeader>
                <CardTitle>Navigasi & Branding (Header)</CardTitle>
                <CardDescription>Atur apakah ingin menampilkan menu atas (header), logo, dan favicon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-sm font-medium p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="useGlobalHeader"
                      className="w-4 h-4 accent-primary"
                      defaultChecked={store.settings?.useGlobalHeader ?? true}
                    />
                    Tampilkan Header Menu (Navigasi Atas) di seluruh halaman
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="useLogo"
                      className="w-4 h-4 accent-primary"
                      defaultChecked={store.settings?.useLogo ?? true}
                    />
                    Tampilkan Logo di dalam Header Menu
                  </label>
                </div>
                
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Favicon (Ikon Tab Browser)</Label>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        name="useFavicon"
                        className="w-4 h-4 accent-primary"
                        defaultChecked={store.settings?.useFavicon ?? true}
                      />
                      Aktifkan Favicon
                    </label>
                  </div>
                  <div className="max-w-xs">
                    <ImageUploadField name="faviconUrl" defaultValue={store.faviconUrl ?? ""} label="Favicon" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                <Button type="submit">Simpan Branding Header</Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manajemen Menu Halaman</CardTitle>
              <CardDescription>Buat halaman baru atau tautan khusus dan urutkan menu sesuai keinginan.</CardDescription>
            </CardHeader>
            <CardContent>
              <MenuManager 
                storeId={store.id} 
                initialMenus={(store.settings?.headerMenus as MenuItemType[]) || []} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================= TAB 3: KONTAK & PENGIRIMAN ======================= */}
        <TabsContent value="kontak" className="space-y-6 mt-4">
          <Card>
            <form action={updateStoreSettings}>
              <CardHeader>
                <CardTitle>Kontak & Lokasi Pengiriman</CardTitle>
                <CardDescription>Atur nomor WhatsApp utama dan lokasi asal toko Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="whatsappNumber">Nomor WhatsApp Bisnis</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    placeholder="08123456789"
                    defaultValue={store.settings?.whatsappNumber ?? ""}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Gunakan format angka tanpa spasi (misal: 08123...).</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label className="text-base block">Lokasi Toko (Untuk Asal Pengiriman)</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="shippingOriginProvince">Provinsi</Label>
                      <Input
                        id="shippingOriginProvince"
                        name="shippingOriginProvince"
                        placeholder="Jawa Barat"
                        defaultValue={store.settings?.shippingOriginProvince ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shippingOriginCity">Kota/Kabupaten</Label>
                      <Input
                        id="shippingOriginCity"
                        name="shippingOriginCity"
                        placeholder="Bandung"
                        defaultValue={store.settings?.shippingOriginCity ?? ""}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                <Button type="submit">Simpan Kontak & Pengiriman</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ======================= TAB 4: PEMBAYARAN ======================= */}
        <TabsContent value="pembayaran" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rekening Bank Manual</CardTitle>
              <CardDescription>Daftar rekening bank yang akan ditampilkan ke pembeli saat checkout transfer manual.</CardDescription>
            </CardHeader>
            <CardContent>
              <BankAccountsEditor initial={bankAccounts} action={updateBankAccounts} />
            </CardContent>
          </Card>

          <Card>
            <form action={updatePaymentSettings}>
              <CardHeader>
                <CardTitle>Payment Gateway & Ongkir</CardTitle>
                <CardDescription>Konfigurasi QRIS, ongkos kirim flat, dan integrasi Midtrans.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5 max-w-sm">
                  <Label htmlFor="flatShippingCost">Ongkos Kirim Flat (Rp)</Label>
                  <Input
                    id="flatShippingCost"
                    name="flatShippingCost"
                    type="number"
                    min={0}
                    defaultValue={store.settings?.flatShippingCost?.toString() ?? "0"}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Biaya kirim rata yang dibebankan ke setiap pesanan.</p>
                </div>
                
                <Separator />
                
                <div className="space-y-1.5 max-w-xs">
                  <Label>Kode QRIS Statis (Opsional)</Label>
                  <ImageUploadField name="qrisImageUrl" defaultValue={store.settings?.qrisImageUrl ?? ""} label="QRIS" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Integrasi Midtrans (Pembayaran Otomatis)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="midtransServerKey">Server Key</Label>
                        {store.settings?.midtransServerKey && <Badge variant="secondary" className="text-[10px]">Terisi</Badge>}
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
                      <Label htmlFor="midtransClientKey">Client Key</Label>
                      <Input
                        id="midtransClientKey"
                        name="midtransClientKey"
                        defaultValue={store.settings?.midtransClientKey ?? ""}
                        placeholder="SB-Mid-client-..."
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-medium p-3 border rounded-lg bg-muted/20 w-fit">
                    <input
                      type="checkbox"
                      name="midtransIsProduction"
                      className="w-4 h-4 accent-primary"
                      defaultChecked={store.settings?.midtransIsProduction ?? false}
                    />
                    Mode Produksi (Centang ini jika sudah bukan environment Sandbox)
                  </label>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                <Button type="submit">Simpan Payment & Ongkir</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ======================= TAB 5: NOTIFIKASI WA ======================= */}
        {store.siteType === "storefront" && (
          <TabsContent value="notifikasi" className="space-y-6 mt-4">
            <Card>
              <form action={updateWhatsAppApiSettings}>
                <CardHeader>
                  <CardTitle>API WhatsApp (Notifikasi Resi Otomatis)</CardTitle>
                  <CardDescription>Kirim pesan WA otomatis ke pembeli saat status pesanan mereka diperbarui.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="whatsappApiUrl">URL API Endpoint</Label>
                      <Input
                        id="whatsappApiUrl"
                        name="whatsappApiUrl"
                        type="url"
                        placeholder="https://api.contoh-wa.com/send"
                        defaultValue={store.settings?.whatsappApiUrl ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="whatsappApiKey">API Key</Label>
                        {store.settings?.whatsappApiKey && <Badge variant="secondary" className="text-[10px]">Terisi</Badge>}
                      </div>
                      <Input
                        id="whatsappApiKey"
                        name="whatsappApiKey"
                        type="password"
                        placeholder={store.settings?.whatsappApiKey ? "Biarkan kosong agar tidak diubah" : ""}
                      />
                    </div>
                  </div>

                  <details className="rounded-lg border bg-muted/10 group">
                    <summary className="cursor-pointer font-medium p-4 hover:bg-muted/20 transition-colors">Pengaturan Request Lanjutan</summary>
                    <div className="p-4 pt-0 space-y-4 border-t mt-2">
                      <p className="text-xs text-muted-foreground mt-2">
                        Default-nya cocok untuk Fonnte & standar API pihak ketiga (Header <code>Authorization</code>, Field <code>target</code> &amp; <code>message</code>). Ubah jika provider WA Anda membutuhkan konfigurasi berbeda.
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
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-4 border-t">
                  <Button type="submit">Simpan API WhatsApp</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}
