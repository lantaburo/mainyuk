"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOperator, deleteOperator } from "./actions";
import { Users, Mail, Trash2 } from "lucide-react";

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
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan operator");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus operator ini? Akses mereka akan dicabut seketika.")) return;

    try {
      await deleteOperator(id);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus operator");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Daftar Operator</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? "Batal" : "Tambah Operator"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Tambah Operator Baru</h3>
          
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" required disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required disabled={loading} />
            </div>
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Operator"}
          </Button>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {initialOperators.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Users className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Belum ada operator terdaftar.</p>
            <p className="text-sm text-gray-400 mt-1">Tambahkan operator baru untuk membantu mengelola sistem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Operator</th>
                  <th className="p-4 font-semibold text-gray-700">Terdaftar</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{op.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {op.email}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {mounted 
                        ? new Date(op.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
                        : "..."
                      }
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                        onClick={() => handleDelete(op.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
