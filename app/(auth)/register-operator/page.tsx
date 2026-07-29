"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function RegisterOperatorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email) && password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setError(null);
    setLoading(true);

    const res = await fetch("/api/register-operator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Terjadi kesalahan, coba lagi");
      setLoading(false);
      return;
    }

    // Auto login
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center bg-[#F6F3EE] px-4 py-12 text-[#0B2B26]">
      <AuthHeader />

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Operator</h1>
        <p className="mt-1 text-sm text-[#0B2B26]/60">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-[#F0640A] hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#0B2B26]/10 bg-white p-6 shadow-xl space-y-4">
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-[#0B3B35] text-white hover:bg-[#0F4A42]"
          disabled={!isValid || loading}
        >
          {loading ? "Mendaftarkan..." : "Daftar Sebagai Operator"}
        </Button>
      </form>
    </div>
  );
}
