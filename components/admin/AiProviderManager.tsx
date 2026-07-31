"use client";

import { useState } from "react";
import { AiProvider } from "@/lib/generated/prisma/client";
import { 
  saveProviderAction, 
  deleteProviderAction, 
  toggleProviderAction, 
  moveProviderAction 
} from "@/app/admin/pengaturan-ai/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUp, ArrowDown, Edit2, Trash2, Plus, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export function AiProviderManager({ providers }: { providers: AiProvider[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<AiProvider | null>(null);

  const handleOpenNew = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (p: AiProvider) => {
    setEditing(p);
    setIsOpen(true);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleProviderAction(id, currentStatus);
      toast.success(currentStatus ? "Provider dinonaktifkan" : "Provider diaktifkan");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    try {
      await moveProviderAction(id, direction);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus provider ini?")) return;
    try {
      await deleteProviderAction(id);
      toast.success("Provider dihapus");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await saveProviderAction(formData);
      toast.success("Provider berhasil disimpan");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Provider</h2>
        <Button onClick={handleOpenNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Provider
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Urutan</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Belum ada provider yang dikonfigurasi.
                </TableCell>
              </TableRow>
            )}
            {providers.map((p, index) => (
              <TableRow key={p.id} className={!p.isActive ? "opacity-60 bg-muted/20" : ""}>
                <TableCell>
                  <div className="flex flex-col gap-1 items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleMove(p.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-mono">{p.priority}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleMove(p.id, "down")}
                      disabled={index === providers.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.provider}</TableCell>
                <TableCell className="font-mono text-xs">{p.model}</TableCell>
                <TableCell>
                  {p.isActive ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Mati</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleToggle(p.id, p.isActive)}
                      title={p.isActive ? "Matikan" : "Aktifkan"}
                    >
                      {p.isActive ? <PowerOff className="w-4 h-4 text-orange-500" /> : <Power className="w-4 h-4 text-green-500" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleOpenEdit(p)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Provider" : "Tambah Provider Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="space-y-1.5">
              <Label htmlFor="provider">Nama Provider (label bebas)</Label>
              <Input
                id="provider"
                name="provider"
                placeholder="mis. OpenAgentic, Ollama, OpenAI"
                defaultValue={editing?.provider ?? ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                placeholder="https://api.openai.com/v1"
                defaultValue={editing?.baseUrl ?? ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder={editing ? "Kosongkan jika tidak ingin mengubah" : "Wajib diisi"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Nama Model</Label>
              <Input
                id="model"
                name="model"
                placeholder="mis. gpt-4o-mini"
                defaultValue={editing?.model ?? ""}
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Simpan Konfigurasi</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
