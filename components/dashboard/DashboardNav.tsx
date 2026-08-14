"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  user: { name: string; classLevel: number };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = [
    { href: "/dashboard", label: "Ruang Belajar", icon: BookOpen },
    { href: "/dashboard/rapor", label: "Rapor & Nilai", icon: GraduationCap },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
            Siswa Kelas {user.classLevel}
          </p>
          <p className="font-bold text-gray-900 truncate">{user.name}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon 
                className={cn(
                  "h-4 w-4 transition-colors", 
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )} 
              />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
        <Link href="/select-profile">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
          >
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            Ganti Profil Anak
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 group"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
          Keluar Induk
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
        <div className="font-bold text-gray-900 truncate flex-1">
          <span className="text-indigo-500">Kelas {user.classLevel}</span> • {user.name}
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-white shadow-sm h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside 
            className="absolute top-0 left-0 bottom-0 w-64 bg-white flex flex-col shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
