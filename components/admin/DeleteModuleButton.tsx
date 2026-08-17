"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteModule } from "@/app/admin/curriculum/actions";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteModuleButton({ moduleId, moduleTitle }: { moduleId: string, moduleTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await deleteModule(moduleId);
      if (res.ok) {
        toast({
          title: "Berhasil dihapus",
          description: `Modul ${moduleTitle} beserta seluruh soalnya telah dihapus.`,
        });
      } else {
        toast({
          title: "Gagal menghapus",
          description: res.error || "Terjadi kesalahan saat menghapus modul.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal menghubungi server.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 z-20"
          onClick={(e) => e.preventDefault()} // Prevent link click
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Modul?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus modul <strong>{moduleTitle}</strong>? 
            Tindakan ini tidak dapat dibatalkan dan akan menghapus <strong>semua soal dan progress siswa</strong> pada modul ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }} 
            className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
