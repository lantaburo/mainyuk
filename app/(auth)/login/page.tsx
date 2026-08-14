"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);

    if (!res || !res.ok || res.error) {
      setError("Email atau password salah. Silakan coba lagi!");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    // Redirect based on role
    router.push(role === "super_admin" || role === "operator" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center px-4 py-12 text-slate-800 bg-slate-50 overflow-hidden font-sans">
      
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10 mx-auto w-full max-w-md">
        <AuthHeader />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Selamat Datang Kembali!</h1>
          <p className="mt-2 text-base text-slate-500 font-medium">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
              Daftar Gratis
            </Link>
          </p>
        </div>

        <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-500/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-700">Email Akun</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 py-6 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-sm font-semibold text-rose-600">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 font-bold py-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all text-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              <LogIn className="size-5" />
              {loading ? "Mengecek Data..." : "Masuk"}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          Lupa password? Silakan hubungi Guru atau Admin sekolah Anda.
        </p>
      </div>
    </div>
  );
}
