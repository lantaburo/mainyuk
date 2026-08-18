"use client";

import { useState } from "react";
import { createOrUpdateSkill, toggleSkillStatus, rollbackSkillVersion } from "@/app/admin/pengaturan-ai/skills/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit, History, ToggleLeft, ToggleRight, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";

export function SkillsListClient({ skills }: { skills: any[] }) {
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [historySkill, setHistorySkill] = useState<any>(null);

  const activeVersions = skills.map(s => s.versions.find((v: any) => v.isActive) || s.versions[0]);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleSkillStatus(id, !currentStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daftar Instruksi AI (Skill Set)</h2>
          <p className="text-sm text-gray-500">Atur instruksi khusus yang akan disisipkan ke prompt AI.</p>
        </div>
        <Button onClick={() => setEditingSkill({})} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Tambah Instruksi
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {skills.map(skill => {
          const activeVersion = skill.versions.find((v: any) => v.isActive);
          return (
            <div key={skill.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${!skill.isActive ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{skill.name}</h3>
                    {skill.isSystem && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">System</span>}
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">v{activeVersion?.version || 0}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{skill.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(skill.id, skill.isActive)}>
                    {skill.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setHistorySkill(skill)} className="rounded-xl">
                    <History className="w-4 h-4 mr-1" /> Riwayat
                  </Button>
                  <Button variant="default" size="sm" onClick={() => setEditingSkill({ ...skill, content: activeVersion?.content || "" })} className="rounded-xl bg-slate-900">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-mono text-slate-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {activeVersion?.content || "Belum ada konten."}
              </div>
            </div>
          );
        })}
      </div>

      {editingSkill && (
        <SkillEditModal 
          skill={editingSkill} 
          onClose={() => setEditingSkill(null)} 
        />
      )}

      {historySkill && (
        <SkillHistoryModal 
          skill={historySkill} 
          onClose={() => setHistorySkill(null)} 
        />
      )}
    </div>
  );
}

function SkillEditModal({ skill, onClose }: { skill: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    if (skill.id) formData.append("id", skill.id);
    
    const res = await createOrUpdateSkill(formData);
    if (res.ok) {
      onClose();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
        <h3 className="text-lg font-bold mb-4">{skill.id ? "Edit Instruksi (Versi Baru)" : "Tambah Instruksi Baru"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Skill</Label>
            <Input name="name" defaultValue={skill.name} readOnly={skill.isSystem} required className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Input name="description" defaultValue={skill.description} required className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Konten / Prompt Instruksi</Label>
            <textarea 
              name="content" 
              defaultValue={skill.content} 
              required 
              rows={8}
              className="w-full rounded-xl border border-input p-3 text-sm font-mono"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan & Buat Versi
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function SkillHistoryModal({ skill, onClose }: { skill: any, onClose: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRollback = async (versionId: string) => {
    if (!confirm("Rollback ke versi ini? Versi saat ini akan dinonaktifkan.")) return;
    setLoadingId(versionId);
    await rollbackSkillVersion(skill.id, versionId);
    setLoadingId(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <h3 className="text-lg font-bold mb-1">Riwayat Versi: {skill.name}</h3>
        <p className="text-sm text-gray-500 mb-4">Pilih versi lama untuk dikembalikan (rollback).</p>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {skill.versions.sort((a: any, b: any) => b.version - a.version).map((v: any) => (
            <div key={v.id} className={`p-4 border rounded-2xl ${v.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Versi {v.version}</span>
                  {v.isActive && <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Aktif</span>}
                  <span className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleString("id-ID")}</span>
                </div>
                {!v.isActive && (
                  <Button size="sm" variant="outline" onClick={() => handleRollback(v.id)} disabled={loadingId === v.id} className="h-7 text-xs rounded-lg">
                    {loadingId === v.id ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : null}
                    Rollback
                  </Button>
                )}
              </div>
              <div className="text-xs font-mono text-gray-600 bg-gray-50 p-3 rounded-xl max-h-32 overflow-y-auto whitespace-pre-wrap">
                {v.content}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t text-right shrink-0">
          <Button variant="ghost" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
