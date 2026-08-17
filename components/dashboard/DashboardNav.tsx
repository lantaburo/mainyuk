"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Users,
  Sparkles,
  Moon,
  Sun,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  user: { name: string; classLevel: number };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const items = [
    { href: "/dashboard", label: "Ruang Belajar", icon: BookOpen },
    { href: "/dashboard/marketplace", label: "Toko Hadiah", icon: Gift },
    { href: "/dashboard/rapor", label: "Rapor & Nilai", icon: GraduationCap },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
            Siswa Kelas {user.classLevel}
          </p>
          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isRapor = item.href === "/dashboard/rapor";
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 overflow-hidden",
                isActive 
                  ? (isRapor ? "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-900 border border-yellow-300 shadow-sm" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300") 
                  : (isRapor ? "text-amber-700 hover:bg-amber-50 hover:text-amber-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100")
              )}
            >
              {isRapor && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-progress-indeterminate pointer-events-none" />
              )}
              <item.icon 
                className={cn(
                  "h-4 w-4 transition-colors relative z-10", 
                  isActive ? (isRapor ? "text-amber-600" : "text-indigo-600") : (isRapor ? "text-amber-500 group-hover:text-amber-600" : "text-gray-400 group-hover:text-gray-600")
                )} 
              />
              <span className="relative z-10 flex-1">{item.label}</span>
              {isRapor && (
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse relative z-10" />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
        {/* Dark Mode Toggle (desktop sidebar) */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        </button>
        <Link href="/select-profile">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
          >
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            Ganti Profil Anak
          </Button>
        </Link>
        <Link href="/dashboard/parents/gifts">
          <Button
            variant="outline"
            className="w-full justify-start text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200 dark:border-amber-800/30 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            <Gift className="mr-2 h-4 w-4 text-amber-500" />
            Kelola Hadiah Anak
          </Button>
        </Link>
        <Link href="/affiliate">
          <Button
            variant="outline"
            className="w-full justify-start text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-800/30 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
            Program Afiliasi
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 group"
          onClick={() => signOut({ callbackUrl: "https://mainyuk.my.id/" })}
        >
          <LogOut className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
          Keluar Induk
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile & Tablet Header (hidden on lg+) */}
      <div className="lg:hidden w-full bg-white dark:bg-slate-900 relative z-40 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="font-bold text-gray-900 dark:text-gray-100 truncate flex-1">
            <span className="text-indigo-500">Kelas {user.classLevel}</span> • {user.name}
          </div>
          <div className="flex items-center gap-1">
            {/* Dark Mode Toggle in header */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 shadow-xl border-b border-gray-100 dark:border-gray-800 flex flex-col max-h-[80vh] overflow-y-auto">
            <SidebarContent />
          </div>
        )}
      </div>

      {/* Desktop Sidebar (visible on lg+) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
