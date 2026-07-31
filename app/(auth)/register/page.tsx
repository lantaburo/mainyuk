"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SITE_TYPE_CONFIG, SITE_TYPES, type SiteType } from "@/lib/site-types";
import { INDUSTRIES, INDUSTRY_CONTENT, DEFAULT_INDUSTRY, type Industry } from "@/lib/industry-content";
import { TEMPLATE_PRESETS, TEMPLATE_STYLE, DEFAULT_TEMPLATE, type TemplatePreset } from "@/lib/templates";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

function PickerCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-[#0B3B35] bg-[#0B3B35]/5"
          : "border-[#0B2B26]/15 hover:bg-[#0B2B26]/5"
      )}
    >
      <div className="font-medium">{label}</div>
      <div className="mt-1 text-xs text-[#0B2B26]/60">{description}</div>
    </button>
  );
}

const STEPS = ["Akun Anda", "Toko Anda", "Jenis Situs", "Kategori Bisnis", "Preset Tampilan"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [siteType, setSiteType] = useState<SiteType>("storefront");
  const [industry, setIndustry] = useState<Industry>(DEFAULT_INDUSTRY);
  const [templateId, setTemplateId] = useState<TemplatePreset>(DEFAULT_TEMPLATE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleStoreNameChange(value: string) {
    setStoreName(value);
    if (!slugTouched) setStoreSlug(slugify(value));
  }

  const stepValid = [
    name.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email) && password.length >= 8,
    storeName.trim().length > 0 && storeSlug.trim().length > 0,
    true,
    true,
    true,
  ][step];

  function goNext() {
    if (!stepValid) return;
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }

    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        storeName,
        storeSlug,
        siteType,
        industry,
        templateId,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Terjadi kesalahan, coba lagi");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!signInRes || !signInRes.ok || signInRes.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-[#F6F3EE] px-4 py-12 text-[#0B2B26]">
      <AuthHeader />

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Buat Toko di klikweb.id</h1>
        <p className="mt-1 text-sm text-[#0B2B26]/60">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-[#F0640A] hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i === step
                  ? "bg-[#F0640A] text-white"
                  : i < step
                    ? "bg-[#0B3B35] text-white"
                    : "bg-[#0B2B26]/10 text-[#0B2B26]/50"
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-4 sm:w-6", i < step ? "bg-[#0B3B35]" : "bg-[#0B2B26]/15")} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#0B2B26]/10 bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-base font-semibold">{STEPS[step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-[#0B2B26]/50">Minimal 8 karakter.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Nama Toko / Bisnis</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeSlug">Alamat Toko</Label>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-[#0B2B26]/50">klikweb.id/</span>
                  <Input
                    id="storeSlug"
                    value={storeSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setStoreSlug(slugify(e.target.value));
                    }}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-[#0B2B26]/50">Bisa diubah lagi nanti dari pengaturan toko.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SITE_TYPES.map((type) => (
                  <PickerCard
                    key={type}
                    label={SITE_TYPE_CONFIG[type].label}
                    description={SITE_TYPE_CONFIG[type].description}
                    selected={siteType === type}
                    onClick={() => setSiteType(type)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-[#0B2B26]/50">Dipakai untuk mengisi contoh konten awal yang relevan.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {INDUSTRIES.map((key) => (
                  <PickerCard
                    key={key}
                    label={INDUSTRY_CONTENT[key].label}
                    description={INDUSTRY_CONTENT[key].description}
                    selected={industry === key}
                    onClick={() => setIndustry(key)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-[#0B2B26]/50">Bisa diganti kapan saja dari pengaturan toko.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {TEMPLATE_PRESETS.map((key) => (
                  <PickerCard
                    key={key}
                    label={TEMPLATE_STYLE[key].label}
                    description={TEMPLATE_STYLE[key].description}
                    selected={templateId === key}
                    onClick={() => setTemplateId(key)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-[#0B2B26]/20"
              onClick={goBack}
              disabled={loading}
            >
              Kembali
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 bg-[#0B3B35] text-white hover:bg-[#0F4A42]"
            disabled={(step < STEPS.length - 1 && !stepValid) || loading}
          >
            {step < STEPS.length - 1 ? "Lanjut" : loading ? "Membuat toko..." : "Buat Toko"}
          </Button>
        </div>
      </form>
    </div>
  );
}
