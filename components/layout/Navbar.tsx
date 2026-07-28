"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Bell, User, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? "Usuario");
      }
    });
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-[#0f172a] border-b border-[#334155] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input Placeholder / Title */}
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar convenio, código, universidad..."
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button
          className="relative p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Notificaciones de Vencimiento"
          onClick={() => router.push('/dashboard')}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 border-l border-[#334155] pl-4">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs hidden md:block">
            <p className="text-slate-200 font-medium leading-tight truncate max-w-[160px]">
              {userEmail || "ori.admin@umariana.edu.co"}
            </p>
            <p className="text-[10px] text-emerald-400">Oficina ORI Active</p>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
