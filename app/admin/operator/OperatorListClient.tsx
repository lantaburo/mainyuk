"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOperator, deleteOperator } from "./actions";

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

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {initialOperators.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Belum ada operator terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Nama</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Terdaftar</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-muted/30">
                    <td className="p-4 font-medium">{op.name}</td>
                    <td className="p-4">{op.email}</td>
                    <td className="p-4">{new Date(op.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(op.id)}
                      >
                        Hapus
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
