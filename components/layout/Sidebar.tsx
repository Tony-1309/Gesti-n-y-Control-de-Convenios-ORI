"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  MapPin,
  Globe2,
  Clock,
  Share2,
  FlaskConical,
  Upload,
  Download,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Int. Vigentes", href: "/convenios/internacionales-vigentes", icon: Globe },
  { name: "IES Nacionales", href: "/convenios/nacionales", icon: MapPin },
  { name: "IES Internacionales", href: "/convenios/internacionales", icon: Globe2 },
  { name: "En Trámite", href: "/convenios/tramite", icon: Clock },
  { name: "REDES", href: "/convenios/redes", icon: Share2 },
  { name: "Investigación", href: "/convenios/investigacion", icon: FlaskConical },
];

const tools = [
  { name: "Importar Matriz", href: "/importar", icon: Upload },
  { name: "Exportar Matriz", href: "/exportar", icon: Download },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-[#334155] flex flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#334155] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          ORI
        </div>
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">Universidad Mariana</h2>
          <p className="text-xs text-amber-400 font-medium">Gestión de Convenios</p>
        </div>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Categorías
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Herramientas
          </p>
          <nav className="space-y-1">
            {tools.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#334155] bg-[#0b1324] text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sistema Seguro</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">v1.0 2026</span>
      </div>
    </aside>
  );
}
