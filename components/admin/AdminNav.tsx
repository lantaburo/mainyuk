"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShieldCheck, Users, Settings, LayoutDashboard, LogOut, Wand2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  const isSuperAdmin = user.role === "super_admin";

  const items = [
    { href: "/admin", label: "Daftar Tenant", icon: LayoutDashboard },
    { href: "/admin/generator-ai", label: "Generator AI", icon: Wand2 },
    ...(isSuperAdmin ? [{ href: "/admin/operator", label: "Operator & Staf", icon: Users }] : []),
    ...(isSuperAdmin ? [{ href: "/admin/pengaturan-ai", label: "Pengaturan AI", icon: Settings }] : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex sticky top-0 h-screen">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 tracking-tight leading-none text-lg">mainyuk.my.id</h1>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">Super Admin</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 mt-2">Menu Utama</div>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )} 
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
          <Avatar className="h-9 w-9 border border-white shadow-sm">
            <AvatarFallback className="bg-indigo-600 text-white font-semibold">
              {user.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">{user.name || "Admin"}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 group"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
