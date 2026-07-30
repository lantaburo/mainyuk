"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addOperator, deleteOperator } from "./actions";
import { Users, Mail, Trash2, Search, ShieldAlert } from "lucide-react";

type Operator = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export function OperatorListClient({ initialOperators }: { initialOperators: Operator[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await addOperator(formData);
      setIsAdding(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Gagal menambahkan operator");
      } else {
        setError("Gagal menambahkan operator");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus operator ini? Akses mereka akan dicabut seketika.")) return;

    try {
      await deleteOperator(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Gagal menghapus operator");
      } else {
        alert("Gagal menghapus operator");
      }
    }
  }

  const filteredOperators = initialOperators.filter(op => {
    const q = search.toLowerCase();
    return op.name.toLowerCase().includes(q) || op.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Daftar Operator</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari nama atau email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white w-full h-9"
            />
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} size="sm" className="h-9">
            {isAdding ? "Batal" : "Tambah Operator"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-6 shadow-lg backdrop-blur-xl mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <form onSubmit={handleAdd} className="relative z-10 space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Tambah Operator Baru</h3>
            
            {error && <p className="text-sm text-red-500 font-medium bg-red-50/50 p-2 rounded-md">{error}</p>}

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-600 font-medium">Nama Lengkap</Label>
                <Input id="name" name="name" required disabled={loading} className="bg-white/60 border-white/50 focus:bg-white transition-all shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-600 font-medium">Email</Label>
                <Input id="email" name="email" type="email" required disabled={loading} className="bg-white/60 border-white/50 focus:bg-white transition-all shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-600 font-medium">Password</Label>
                <Input id="password" name="password" type="password" minLength={8} required disabled={loading} className="bg-white/60 border-white/50 focus:bg-white transition-all shadow-sm" />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all font-semibold">
              {loading ? "Menyimpan..." : "Simpan Operator"}
            </Button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 pointer-events-none" />
        <div className="relative z-10">
          {filteredOperators.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white/50 mb-4 relative z-10">
                <Users className="h-10 w-10 text-indigo-400" />
              </div>
              <p className="text-slate-700 font-bold text-lg relative z-10">Belum ada operator terdaftar</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm relative z-10">
                Operator dapat membantu Anda mengelola tenant dan pengaturan platform tanpa memiliki akses Super Admin penuh.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 backdrop-blur-md border-b border-white/50">
                  <tr className="hover:bg-transparent">
                    <th className="p-4 font-semibold text-slate-700">Profil Operator</th>
                    <th className="p-4 font-semibold text-slate-700">Peran</th>
                    <th className="p-4 font-semibold text-slate-700">Terdaftar</th>
                    <th className="p-4 font-semibold text-slate-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {filteredOperators.map((op) => {
                    // Generate pseudo-random gradient based on name length
                    const gradients = [
                      "from-indigo-500 to-purple-500",
                      "from-blue-500 to-cyan-500",
                      "from-emerald-500 to-teal-500",
                      "from-orange-500 to-red-500",
                      "from-pink-500 to-rose-500"
                    ];
                    const grad = gradients[op.name.length % gradients.length];
                    
                    return (
                      <tr key={op.id} className="hover:bg-white/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className={`h-10 w-10 border-2 border-white shadow-sm bg-gradient-to-br ${grad}`}>
                              <AvatarFallback className="bg-transparent text-white font-bold drop-shadow-md">
                                {op.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-slate-800 drop-shadow-sm">{op.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                                <Mail className="h-3 w-3 text-slate-400" /> {op.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-blue-700 shadow-sm border border-white">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            OPERATOR
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 whitespace-nowrap font-medium">
                          {mounted 
                            ? new Date(op.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
                            : "..."
                          }
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 gap-1.5 border-transparent bg-white/50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all font-medium text-slate-600 shadow-sm" 
                            onClick={() => handleDelete(op.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Hapus Akses</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
