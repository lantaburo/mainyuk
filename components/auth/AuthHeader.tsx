import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function AuthHeader() {
  return (
    <div className="mb-8 flex justify-center">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/30">
          <GraduationCap className="text-white size-8" />
        </div>
        <span className="text-3xl font-black tracking-tight text-slate-800">
          Main<span className="text-indigo-600">Yuk</span>
        </span>
      </Link>
    </div>
  );
}
