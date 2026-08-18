"use client";

import { useState } from "react";
import { deleteAiDocument } from "@/app/admin/pengaturan-ai/documents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, Trash2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentsClient({ documents, subjects }: { documents: any[], subjects: any[] }) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const res = await fetch("/api/ai/upload-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        form.reset();
        router.refresh();
      } else {
        alert(data.error || "Gagal mengunggah dokumen.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen ini? AI tidak akan bisa lagi membacanya.")) return;
    setDeletingId(id);
    const res = await deleteAiDocument(id);
    if (!res.ok) alert(res.error);
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          Unggah Dokumen Referensi
        </h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Judul Dokumen</Label>
              <Input name="title" placeholder="Misal: Buku Panduan Tsaqafah Kelas 1" required className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Mata Pelajaran (Opsional)</Label>
              <select name="subjectId" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">-- Global (Berlaku untuk semua) --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Jika dikosongkan, AI akan membaca dokumen ini untuk semua soal.</p>
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <Label>File PDF / TXT</Label>
              <Input name="file" type="file" accept=".pdf,.txt" required className="rounded-xl" />
            </div>
            <Button type="submit" disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
              {uploading ? "Mengunggah & Mengekstrak..." : "Unggah Dokumen"}
            </Button>
          </div>
        </form>
      </div>

      {/* Document List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Daftar Dokumen Tersimpan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white border rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-gray-900 truncate" title={doc.title}>{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {doc.subject ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full truncate">
                        {doc.subject.name}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Global
                      </span>
                    )}
                    <span className="text-xs text-gray-400 truncate">{doc.fileName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {doc.extractedText ? `${doc.extractedText.length.toLocaleString()} karakter terekstrak` : "Teks kosong"}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDelete(doc.id)} 
                disabled={deletingId === doc.id}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
              >
                {deletingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-500">
              Belum ada dokumen referensi yang diunggah.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
