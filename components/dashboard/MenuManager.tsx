"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Trash2, Edit, ExternalLink, Plus, Loader2 } from "lucide-react";
import { updateMenusAction, createCustomPageAction, deleteCustomPageAction } from "@/app/dashboard/pengaturan/actions";

export type MenuItemType = {
  id: string;
  label: string;
  type: "page" | "url";
  target?: string;
  isVisible: boolean;
};

export function MenuManager({ initialMenus, storeId }: { initialMenus: MenuItemType[]; storeId: string }) {
  const [menus, setMenus] = useState<MenuItemType[]>(initialMenus || []);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<"page" | "url">("page");
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const saveMenus = (newMenus: MenuItemType[]) => {
    setMenus(newMenus);
    startTransition(async () => {
      try {
        await updateMenusAction(newMenus);
        toast.success("Menu berhasil disimpan");
      } catch (err: any) {
        toast.error("Gagal menyimpan menu: " + err.message);
      }
    });
  };

  const handleAddMenu = async () => {
    if (!newLabel.trim()) return toast.error("Label menu harus diisi");
    
    setIsAdding(true);
    try {
      let finalTarget = newUrl;
      let newId = Math.random().toString(36).substring(2, 9);
      
      if (newType === "page") {
        const res = await createCustomPageAction(newLabel);
        if (!res || !res.ok) throw new Error("Gagal membuat halaman");
        finalTarget = res.pageId;
        newId = res.pageId;
      }

      const newMenu: MenuItemType = {
        id: newId,
        label: newLabel,
        type: newType,
        target: finalTarget,
        isVisible: true,
      };

      saveMenus([...menus, newMenu]);
      setShowAdd(false);
      setNewLabel("");
      setNewUrl("");
      setNewType("page");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, type: "page" | "url", target?: string) => {
    if (!confirm("Hapus menu ini?")) return;
    
    const newMenus = menus.filter(m => m.id !== id);
    setMenus(newMenus);
    
    startTransition(async () => {
      try {
        await updateMenusAction(newMenus);
        if (type === "page" && target) {
          await deleteCustomPageAction(target);
        }
        toast.success("Menu dihapus");
      } catch (err: any) {
        toast.error("Gagal menghapus: " + err.message);
      }
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[index - 1];
    newMenus[index - 1] = temp;
    saveMenus(newMenus);
  };

  const moveDown = (index: number) => {
    if (index === menus.length - 1) return;
    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[index + 1];
    newMenus[index + 1] = temp;
    saveMenus(newMenus);
  };

  const toggleVisibility = (id: string) => {
    const newMenus = menus.map(m => m.id === id ? { ...m, isVisible: !m.isVisible } : m);
    saveMenus(newMenus);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {menus.length === 0 ? (
          <div className="p-4 border rounded-lg text-center text-sm text-gray-500 bg-gray-50">
            Belum ada menu khusus. Navigasi bawaan akan ditampilkan (berdasarkan tipe situs).
          </div>
        ) : (
          menus.map((menu, index) => (
            <div key={menu.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(index)} disabled={index === 0 || isPending} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                <button onClick={() => moveDown(index)} disabled={index === menus.length - 1 || isPending} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{menu.label}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {menu.type === "page" ? (
                    <>Tipe: Halaman Internal (Klik Edit untuk mendesain)</>
                  ) : (
                    <>Tipe: Link URL <ExternalLink className="w-3 h-3" /> {menu.target}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleVisibility(menu.id)}
                  disabled={isPending}
                  className={`text-xs px-2 py-1 rounded-full border ${menu.isVisible ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                >
                  {menu.isVisible ? "Tampil" : "Disembunyi"}
                </button>
                {menu.type === "page" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/editor?pageId=${menu.target}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Halaman
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(menu.id, menu.type, menu.target)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd ? (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <h4 className="font-medium text-sm">Tambah Menu Baru</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Label Menu</Label>
              <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="mis: Promo Bulan Ini" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Select value={newType} onValueChange={(val: any) => setNewType(val || "page")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Buat Halaman Baru</SelectItem>
                  <SelectItem value="url">Link Eksternal / Custom URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {newType === "url" && (
            <div className="space-y-1.5">
              <Label>URL Tujuan</Label>
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Batal</Button>
            <Button size="sm" onClick={handleAddMenu} disabled={isAdding || !newLabel.trim()}>
              {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {newType === "page" ? "Generate & Tambah" : "Tambah Menu"}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Menu / Halaman
        </Button>
      )}
    </div>
  );
}
