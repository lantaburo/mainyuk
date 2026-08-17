"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteSubject } from "@/app/admin/curriculum/actions";
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

export function DeleteSubjectButton({ subjectId, subjectName }: { subjectId: string, subjectName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await deleteSubject(subjectId);
      if (res.ok) {
        toast.success(`Mata pelajaran ${subjectName} berhasil dihapus beserta seluruh modul dan soalnya.`);
        setOpen(false);
      } else {
        toast.error(res.error || "Terjadi kesalahan saat menghapus mata pelajaran.");
      }
    } catch {
      toast.error("Gagal menghubungi server.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 z-20"
          onClick={(e) => e.preventDefault()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Hapus Mata Pelajaran?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{subjectName}</strong>?{" "}
            Tindakan ini tidak dapat dibatalkan dan akan menghapus{" "}
            <strong>semua modul dan soal</strong> yang terkait di semua kelas.
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
