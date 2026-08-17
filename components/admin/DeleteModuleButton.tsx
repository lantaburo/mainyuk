"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteModule } from "@/app/admin/curriculum/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteModuleButton({ moduleId, moduleTitle }: { moduleId: string, moduleTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteModule(moduleId);
      toast.success(`Modul ${moduleTitle} beserta seluruh soalnya telah dihapus.`);
      setOpen(false);
    } catch {
      toast.error("Gagal menghapus modul.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 z-20"
            onClick={(e) => e.preventDefault()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Hapus Modul?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus modul <strong>{moduleTitle}</strong>?{" "}
            Tindakan ini tidak dapat dibatalkan dan akan menghapus{" "}
            <strong>semua soal dan progress siswa</strong> pada modul ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
