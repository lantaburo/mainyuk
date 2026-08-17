"use client";

import { useState } from "react";
import { User, StudentProfile } from "@/lib/generated/prisma2/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Trash2, Shield, Users, Baby, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAccount, updateUserRole, deleteChildProfile } from "@/app/admin/pengguna/actions";
import { useRouter } from "next/navigation";

type UserWithChildren = User & {
  children: StudentProfile[];
};

export function PenggunaClient({ users, currentUserId }: { users: UserWithChildren[], currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId);
    const res = await updateUserRole(userId, newRole);
    if (res.ok) {
      toast.success("Role berhasil diubah");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal mengubah role");
    }
    setLoading(null);
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`PERINGATAN! Anda yakin ingin menghapus akun ${name}? Semua data anak dan riwayat nilai akan HILANG secara permanen.`)) {
      return;
    }

    setLoading(userId);
    const res = await deleteUserAccount(userId);
    if (res.ok) {
      toast.success("Akun berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menghapus akun");
    }
    setLoading(null);
  };

  const handleDeleteChild = async (childId: string, name: string) => {
    if (!confirm(`Hapus profil anak ${name}? Riwayat nilainya akan hilang.`)) {
      return;
    }
    const res = await deleteChildProfile(childId);
    if (res.ok) {
      toast.success("Profil anak dihapus");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menghapus anak");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead>Nama Pengguna</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tgl Daftar</TableHead>
            <TableHead className="text-center">Profil Anak</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                  {user.id === currentUserId && (
                    <Badge variant="outline" className="ml-2 text-xs">Anda</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-500">{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  disabled={loading === user.id || user.id === currentUserId}
                  onValueChange={(val) => handleRoleChange(user.id, val)}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('id-ID')}
              </TableCell>
              <TableCell className="text-center">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-2" />}>
                    <Baby className="w-4 h-4 text-indigo-500" />
                    {user.children.length} Anak
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Daftar Anak - {user.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      {user.children.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          Pengguna ini belum membuat profil anak.
                        </div>
                      ) : (
                        user.children.map((child: StudentProfile) => (
                          <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div>
                              <div className="font-semibold text-gray-900">{child.name}</div>
                              <div className="text-xs text-gray-500">Kelas {child.gradeLevel} SD</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteChild(child.id, child.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={loading === user.id || user.id === currentUserId}
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  title="Hapus Pengguna"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                Belum ada pengguna.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
