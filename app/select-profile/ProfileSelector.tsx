"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Profile {
  id: string;
  name: string;
  gradeLevel: number;
}

export function ProfileSelector({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(profiles.length === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus profil ini? SEMUA DATA NILAI AKAN HILANG PERMANEN!")) return;
    
    const res = await fetch(`/api/edu/delete-child?id=${profileId}`, { method: 'DELETE' });
    if (res.ok) {
      // If we just deleted the active profile, clear the cookie
      const activeId = getCookie("selectedStudentId");
      if (activeId === profileId) {
        deleteCookie("selectedStudentId");
      }
      router.refresh();
    }
  };

  const handleSelect = (profileId: string) => {
    setCookie("selectedStudentId", profileId, { maxAge: 60 * 60 * 24 * 30 });
    router.push("/dashboard");
    router.refresh();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/edu/add-child", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gradeLevel: parseInt(grade) })
    });

    if (res.ok) {
      setName("");
      setGrade("1");
      setIsAdding(false);
      router.refresh();
    } else {
      try {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan data.");
      } catch {
        setErrorMsg("Terjadi kesalahan sistem (Server Error).");
      }
    }
    setLoading(false);
  };

  if (isAdding) {
    return (
      <form onSubmit={handleAdd} className="bg-white p-8 rounded-[2rem] border-4 border-indigo-400 shadow-[0_8px_0_0_rgba(129,140,248,1)] max-w-md mx-auto relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-300 rounded-full opacity-50 blur-2xl"></div>
        
        <h2 className="text-2xl font-black mb-6 text-indigo-900 text-center relative z-10 flex items-center justify-center gap-2">
          <span className="text-4xl">👧👦</span>
          Tambah Anak Baru
        </h2>
        
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-2xl text-sm font-bold border-2 border-red-300 relative z-10 text-center">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label className="font-bold text-lg text-indigo-900">Nama Panggilan</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="Contoh: Budi" 
              className="rounded-2xl border-2 border-indigo-200 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 h-14 text-lg font-medium px-4 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-lg text-indigo-900">Tingkat Kelas</Label>
            <Select value={grade} onValueChange={(val) => { if (val) setGrade(val); }}>
              <SelectTrigger className="rounded-2xl border-2 border-indigo-200 h-14 text-lg font-medium shadow-sm focus:ring-indigo-400">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-2 border-indigo-200">
                {[1,2,3,4,5,6,7,8,9].map(g => (
                  <SelectItem key={g} value={g.toString()} className="text-lg font-medium py-3 cursor-pointer">Kelas {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex gap-4">
            {profiles.length > 0 && (
              <Button type="button" variant="outline" className="flex-1 rounded-2xl h-14 text-lg font-bold border-2 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={() => setIsAdding(false)}>
                Kembali
              </Button>
            )}
            <Button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 rounded-2xl h-14 text-lg font-black border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Simpan Yuk! 🚀"}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {profiles.map((profile, i) => {
          const colors = ["bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500"];
          const color = colors[i % colors.length];

          return (
            <div key={profile.id} className="relative group flex flex-col items-center">
              <div
                onClick={() => !isEditing && handleSelect(profile.id)}
                className={`group flex flex-col items-center transition-transform ${!isEditing ? 'hover:scale-110 cursor-pointer' : ''}`}
              >
                <div className={`w-28 h-28 md:w-36 md:h-36 rounded-2xl ${color} flex items-center justify-center shadow-lg border-4 border-transparent ${!isEditing ? 'group-hover:border-white' : ''} transition-all relative overflow-hidden`}>
                  <span className="text-4xl md:text-6xl text-white font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <button 
                        onClick={(e) => handleDelete(profile.id, e)}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-transform hover:scale-110 cursor-pointer"
                        title="Hapus Profil"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
                <span className={`mt-4 text-xl font-medium text-slate-300 ${!isEditing ? 'group-hover:text-white' : ''}`}>
                  {profile.name}
                </span>
                <span className="mt-1 text-sm text-slate-400">
                  Kelas {profile.gradeLevel}
                </span>
              </div>
            </div>
          );
        })}

        {profiles.length < 3 ? (
          <button
            onClick={() => setIsAdding(true)}
            className="group flex flex-col items-center transition-transform hover:scale-110"
            disabled={isEditing}
          >
            <div className={`w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg border-4 border-transparent group-hover:border-white border-dashed transition-all ${isEditing ? 'opacity-50' : ''}`}>
              <PlusCircle className="text-4xl md:text-6xl text-white/50 group-hover:text-white" />
            </div>
            <span className={`mt-4 text-xl font-medium text-slate-400 ${!isEditing && 'group-hover:text-white'}`}>
              Tambah Anak
            </span>
          </button>
        ) : (
          <button
            className={`group flex flex-col items-center opacity-70 ${isEditing ? 'hidden' : 'cursor-not-allowed'}`}
            title="Buka akses Premium untuk menambahkan lebih banyak anak"
            disabled={true}
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-amber-500/20 flex items-center justify-center shadow-lg border-4 border-transparent border-dashed">
              <div className="flex flex-col items-center text-amber-500">
                <PlusCircle className="text-3xl md:text-5xl mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">Premium</span>
              </div>
            </div>
            <span className="mt-4 text-xl font-medium text-amber-500/80">
              Tambah Anak
            </span>
          </button>
        )}
      </div>

      {profiles.length > 0 && (
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-transparent border-gray-500 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          {isEditing ? "Selesai Mengatur" : "Atur Profil"}
        </Button>
      )}
    </div>
  );
}
