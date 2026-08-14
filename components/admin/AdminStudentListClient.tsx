"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap } from "lucide-react";

type StudentData = {
  id: string;
  name: string;
  gradeLevel: number;
  createdAt: Date;
  parent: {
    name: string | null;
    email: string | null;
  };
  _count: {
    progress: number;
  };
};

export function AdminStudentListClient({ initialStudents }: { initialStudents: StudentData[] }) {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStudents = initialStudents.filter(student => {
    const q = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      (student.parent.email && student.parent.email.toLowerCase().includes(q)) ||
      (student.parent.name && student.parent.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari nama siswa atau email orang tua..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 pointer-events-none" />
        <div className="relative z-10">
          <Table>
            <TableHeader className="bg-slate-50/50 backdrop-blur-md border-b border-white/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700">Nama Siswa</TableHead>
                <TableHead className="font-semibold text-slate-700">Kelas</TableHead>
                <TableHead className="font-semibold text-slate-700">Orang Tua</TableHead>
                <TableHead className="font-semibold text-slate-700">Progres Selesai</TableHead>
                <TableHead className="font-semibold text-slate-700">Tanggal Bergabung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center text-slate-500 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                      <GraduationCap className="h-12 w-12 text-slate-300 mb-4 relative z-10" />
                      <p className="font-bold text-slate-700 text-lg relative z-10">Tidak ada siswa ditemukan</p>
                      <p className="text-sm text-slate-500 mt-1 relative z-10">Coba gunakan kata kunci pencarian yang berbeda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-white/60 transition-colors border-b border-white/40">
                    <TableCell>
                      <div className="font-bold text-indigo-600">
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 w-fit uppercase tracking-wider shadow-sm border border-white">
                        Kelas {student.gradeLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-800">{student.parent.name || "Tidak ada nama"}</div>
                      <div className="text-xs text-slate-500">{student.parent.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-emerald-600">
                        {student._count.progress} Modul
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-500 whitespace-nowrap">
                      {mounted 
                        ? new Date(student.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
                        : "..."
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
