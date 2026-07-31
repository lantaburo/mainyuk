"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);

    if (!res || !res.ok || res.error) {
      setError("Email atau password salah, atau server sedang sibuk.");
      return;
    }

    const session = await getSession();
    const role = session?.user.role;
    router.push(role === "super_admin" || role === "operator" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center px-4 py-12 text-[#0B2B26] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-turtle.png"
          alt="Background"
          className="h-full w-full object-cover object-[72%_center] sm:object-[65%_center] lg:object-center opacity-40"
        />
        {/* Optional overlay to ensure form readability if image is bright */}
        <div className="absolute inset-0 bg-[#F6F3EE]/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-sm">
        <AuthHeader />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Masuk ke klikweb.id</h1>
          <p className="mt-1 text-sm text-[#0B2B26]/60">
            Belum punya toko?{" "}
            <Link href="/register" className="font-medium text-[#F0640A] hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-[#0B2B26]/10 bg-white p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#0B3B35] text-white hover:bg-[#0F4A42]"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
