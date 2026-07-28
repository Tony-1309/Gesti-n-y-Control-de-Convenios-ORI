"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Bell,
  BellOff,
  Save,
  ArrowLeft,
  Calendar,
  Send,
  Building,
  Mail,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function ConvenioDetailPage({
  params,
}: {
  params: Promise<{ tabla: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const { tabla, id } = resolvedParams;
  const router = useRouter();
  const supabase = createClient();

  const [convenio, setConvenio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from(tabla).select("*").eq("id", id).single();
      if (data) {
        setConvenio(data);
      }
      setLoading(false);
    }
    loadData();
  }, [tabla, id, supabase]);

  const handleChange = (field: string, val: any) => {
    setConvenio((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const { error } = await supabase.from(tabla).update(convenio).eq("id", id);
    setSaving(false);

    if (!error) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch("/api/cron/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convenioId: id,
          tabla,
          test: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestEmailResult("¡Correo de notificación enviado exitosamente!");
      } else {
        setTestEmailResult(`Error: ${data.error || "No se pudo enviar el correo."}`);
      }
    } catch (e: any) {
      setTestEmailResult(`Error: ${e.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Cargando detalles del convenio...
      </div>
    );
  }

  if (!convenio) {
    return (
      <div className="py-12 text-center text-red-400 text-xs">
        Convenio no encontrado.
      </div>
    );
  }

  const notifActive = convenio.notificaciones_activas !== false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado</span>
        </button>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Guardado correctamente
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-xs py-2 px-4 shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {/* Main Title Card */}
      <div className="glass-card">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              {tabla.replace("_", " ").toUpperCase()}
            </span>
            <h1 className="text-xl font-bold text-white mt-2">
              {convenio.universidad || convenio.universidad_entidad || convenio.red_nombre || convenio.institucion || "Detalle del Convenio"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Código / Ref: {convenio.codificacion || convenio.codigo || convenio.item || "Sin Código"}
            </p>
          </div>

          <div className="text-right">
            <span className={`badge ${convenio.estado_general === 'VIGENTE' ? 'badge-success' : 'badge-danger'}`}>
              {convenio.estado_general || 'SIN ESTADO'}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Control Panel */}
      <div className="glass-card border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Ajustes de Notificaciones y Alertas por Vencimiento
            </h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-xs font-semibold text-slate-300">
              {notifActive ? "Notificaciones Activas" : "Notificaciones Desactivadas"}
            </span>
            <input
              type="checkbox"
              checked={notifActive}
              onChange={(e) => handleChange("notificaciones_activas", e.target.checked)}
              className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
            />
          </label>
        </div>

        {!notifActive && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
            <label className="block text-xs font-semibold text-amber-300">
              Razón / Motivo de Desactivación:
            </label>
            <textarea
              rows={2}
              value={convenio.razon_desactivacion || ""}
              onChange={(e) => handleChange("razon_desactivacion", e.target.value)}
              placeholder="Ej. El convenio ya fue renovado / cambio de programa de movilidad..."
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-blue-400">🔵 Alertar a 15 Días</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_15dias !== false}
              onChange={(e) => handleChange("notificacion_15dias", e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-yellow-400">🟡 Alertar a 10 Días</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_10dias !== false}
              onChange={(e) => handleChange("notificacion_10dias", e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-amber-400">🟠 Alertar a 5 Días</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_5dias !== false}
              onChange={(e) => handleChange("notificacion_5dias", e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-red-400">🔴 Alertar a 1 Día</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_1dia !== false}
              onChange={(e) => handleChange("notificacion_1dia", e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-[#334155] flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Prueba de notificación por correo (envía alerta inmediata via Resend API):
          </p>
          <button
            onClick={handleSendTestNotification}
            disabled={sendingTestEmail}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>{sendingTestEmail ? "Enviando..." : "Enviar Correo Prueba"}</span>
          </button>
        </div>

        {testEmailResult && (
          <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
            {testEmailResult}
          </div>
        )}
      </div>

      {/* Editable Fields Form */}
      <div className="glass-card space-y-6">
        <h2 className="text-base font-bold text-white border-b border-[#334155] pb-2">
          Datos Generales del Convenio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Universidad / Entidad Contraparte
            </label>
            <input
              type="text"
              value={convenio.universidad || convenio.universidad_entidad || convenio.red_nombre || convenio.institucion || ""}
              onChange={(e) => handleChange(convenio.universidad !== undefined ? "universidad" : "universidad_entidad", e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              País / Ciudad
            </label>
            <input
              type="text"
              value={convenio.pais || convenio.ciudad || convenio.pais_ciudad || ""}
              onChange={(e) => handleChange(convenio.pais !== undefined ? "pais" : "ciudad", e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vigencia Desde (Actual)
            </label>
            <input
              type="date"
              value={convenio.vigencia_desde_actual || convenio.vigencia_desde || ""}
              onChange={(e) => handleChange(convenio.vigencia_desde_actual !== undefined ? "vigencia_desde_actual" : "vigencia_desde", e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vigencia Hasta (Actual)
            </label>
            <input
              type="date"
              value={convenio.vigencia_hasta_actual || convenio.vigencia_hasta || ""}
              onChange={(e) => handleChange(convenio.vigencia_hasta_actual !== undefined ? "vigencia_hasta_actual" : "vigencia_hasta", e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Correo Electrónico de Contacto
            </label>
            <input
              type="email"
              value={convenio.correo_electronico || convenio.contacto || ""}
              onChange={(e) => handleChange(convenio.correo_electronico !== undefined ? "correo_electronico" : "contacto", e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estado General
            </label>
            <select
              value={convenio.estado_general || "VIGENTE"}
              onChange={(e) => handleChange("estado_general", e.target.value)}
              className="form-input"
            >
              <option value="VIGENTE">VIGENTE</option>
              <option value="TERMINADO">TERMINADO</option>
              <option value="VENCIDO">VENCIDO</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Objetivo del Convenio
            </label>
            <textarea
              rows={3}
              value={convenio.objetivo || ""}
              onChange={(e) => handleChange("objetivo", e.target.value)}
              className="form-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones Adicionales / Enlace a Documento
            </label>
            <input
              type="text"
              value={convenio.observaciones || ""}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
