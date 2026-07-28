import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Globe,
  MapPin,
  Globe2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export const revalidate = 0; // Fresh server data on every request

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch counts from all 6 tables
  const [
    { count: countIntVigentes },
    { count: countNacionales },
    { count: countInternacionales },
    { count: countTramite },
    { count: countRedes },
    { count: countInvestigacion },
    { data: proximosVencer },
  ] = await Promise.all([
    supabase.from("convenios_internacionales_vigentes").select("*", { count: "exact", head: true }),
    supabase.from("convenios_nacionales").select("*", { count: "exact", head: true }),
    supabase.from("convenios_internacionales").select("*", { count: "exact", head: true }),
    supabase.from("convenios_tramite").select("*", { count: "exact", head: true }),
    supabase.from("convenios_redes").select("*", { count: "exact", head: true }),
    supabase.from("convenios_investigacion").select("*", { count: "exact", head: true }),
    supabase.from("convenios_proximos_vencer").select("*").order("dias_restantes", { ascending: true }).limit(10),
  ]);

  const totalVigentes = (countIntVigentes || 0) + (countNacionales || 0);

  // Group upcoming expirations by threshold
  const urgentes1d = proximosVencer?.filter((item) => item.dias_restantes <= 1) || [];
  const urgentes5d = proximosVencer?.filter((item) => item.dias_restantes > 1 && item.dias_restantes <= 5) || [];
  const prevencion10d = proximosVencer?.filter((item) => item.dias_restantes > 5 && item.dias_restantes <= 10) || [];
  const informativos15d = proximosVencer?.filter((item) => item.dias_restantes > 10 && item.dias_restantes <= 15) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a2e5a] via-[#1e3a8a] to-[#0f172a] rounded-2xl p-6 border border-blue-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Panel de Control Central
          </span>
          <h1 className="text-2xl font-bold text-white mt-2">
            Gestión de Convenios ORI 2026
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Control en tiempo real, alertas de vencimiento automatizadas y trazabilidad completa de convenios nacionales e internacionales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/importar"
            className="btn btn-gold text-xs py-2.5 px-4 shadow-lg flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Matriz Excel</span>
          </Link>
          <Link
            href="/exportar"
            className="btn btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <span>Exportar Matriz</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Int. Vigentes</p>
            <h3 className="text-2xl font-bold text-white mt-1">{countIntVigentes || 0}</h3>
            <span className="text-[10px] text-emerald-400 font-medium">Con filtro de vigencia</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">IES Nacionales</p>
            <h3 className="text-2xl font-bold text-white mt-1">{countNacionales || 0}</h3>
            <span className="text-[10px] text-blue-400 font-medium">Instituciones Colombia</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">IES Internacionales</p>
            <h3 className="text-2xl font-bold text-white mt-1">{countInternacionales || 0}</h3>
            <span className="text-[10px] text-slate-400 font-medium">Histórico Total</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Globe2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">En Trámite</p>
            <h3 className="text-2xl font-bold text-white mt-1">{countTramite || 0}</h3>
            <span className="text-[10px] text-purple-400 font-medium">Procesos activos</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Notifications & Expirations Section */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Sistema de Alertas por Vencimiento
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="badge badge-danger">🔴 1D: {urgentes1d.length}</span>
            <span className="badge badge-warning">🟠 5D: {urgentes5d.length}</span>
            <span className="badge badge-caution">🟡 10D: {prevencion10d.length}</span>
            <span className="badge badge-info">🔵 15D: {informativos15d.length}</span>
          </div>
        </div>

        {(!proximosVencer || proximosVencer.length === 0) ? (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="font-semibold text-slate-300">No hay convenios en umbral crítico de vencimiento hoy.</p>
            <p className="text-slate-500">Todos los convenios vigentes están al día o fuera del período de 15 días.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {proximosVencer.map((item) => {
              let badgeClass = "badge-info";
              let badgeText = `${item.dias_restantes} días restantes`;
              let iconColor = "text-blue-400";

              if (item.dias_restantes <= 1) {
                badgeClass = "badge-danger";
                badgeText = "CRÍTICO (Último Día)";
                iconColor = "text-red-400";
              } else if (item.dias_restantes <= 5) {
                badgeClass = "badge-warning";
                badgeText = `${item.dias_restantes} días (Urgente)`;
                iconColor = "text-amber-400";
              } else if (item.dias_restantes <= 10) {
                badgeClass = "badge-caution";
                badgeText = `${item.dias_restantes} días (Prevención)`;
                iconColor = "text-yellow-400";
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-[#334155] hover:border-slate-600 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${iconColor} shrink-0`} />
                    <div>
                      <p className="font-semibold text-white">
                        {item.institucion || item.codigo || "Convenio Sin Nombre"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Código: {item.codigo || "N/A"} • Vence: {item.fecha_vencimiento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`badge ${badgeClass}`}>{badgeText}</span>
                    <Link
                      href={`/convenios/${item.tabla_origen}/${item.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
