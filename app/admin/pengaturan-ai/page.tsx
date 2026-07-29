import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { updateAiSettings } from "@/app/admin/pengaturan-ai/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PengaturanAiPage() {
  await requireSuperAdmin();

  const settings = await prisma.aiSettings.findFirst();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">Pengaturan AI</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kredensial ini dipakai untuk fitur &ldquo;Generate dengan AI&rdquo; di halaman Generator AI tiap
        tenant. Format request mengikuti standar OpenAI-compatible (Chat Completions), jadi bisa
        diisi provider apa saja yang mendukung format ini — OpenAI, Sumopod, OpenRouter, Groq,
        atau model lokal.
      </p>

      <div className="mt-4">
        {settings ? (
          <Badge>Sudah dikonfigurasi ({settings.provider || "tanpa label"})</Badge>
        ) : (
          <Badge variant="secondary">Belum dikonfigurasi</Badge>
        )}
      </div>

      <form action={updateAiSettings} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="provider">Nama Provider (label bebas)</Label>
          <Input
            id="provider"
            name="provider"
            placeholder="mis. OpenAI, Sumopod, OpenRouter"
            defaultValue={settings?.provider ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            name="baseUrl"
            placeholder="https://api.openai.com/v1"
            defaultValue={settings?.baseUrl ?? ""}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            placeholder={settings ? "Biarkan kosong agar tidak diubah" : "Wajib diisi"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">Nama Model</Label>
          <Input
            id="model"
            name="model"
            placeholder="mis. gpt-4o-mini"
            defaultValue={settings?.model ?? ""}
            required
          />
        </div>
        <Button type="submit">Simpan Pengaturan</Button>
      </form>
    </div>
  );
}
