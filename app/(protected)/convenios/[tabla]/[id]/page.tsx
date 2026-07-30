"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Bell,
  Save,
  ArrowLeft,
  Send,
  CheckCircle,
  MailCheck,
} from "lucide-react";

interface FieldSpec {
  key: string;
  label: string;
  type?: "text" | "date" | "select" | "number" | "textarea";
  options?: string[];
  fullWidth?: boolean;
}

function getFieldSpecsForTable(tabla: string): FieldSpec[] {
  if (tabla === "convenios_tramite") {
    return [
      { key: "item", label: "Item / Número Ref", type: "number" },
      { key: "fecha_recepcion", label: "Fecha de Recepción", type: "date" },
      { key: "facultad_solicitante", label: "Facultad Solicitante" },
      { key: "programa_academico", label: "Programa Académico" },
      { key: "persona_solicitante", label: "Persona Solicitante" },
      { key: "tipo_convenio", label: "Tipo Convenio" },
      { key: "institucion", label: "Institución / Universidad Contraparte" },
      { key: "pais_ciudad", label: "País / Ciudad" },
      { key: "contacto", label: "Contacto / Correo Electrónico" },
      { key: "estado_tramite", label: "Estado del Trámite" },
      { key: "accion_pendiente", label: "Acción Pendiente", fullWidth: true },
      { key: "observaciones", label: "Observaciones Adicionales", type: "textarea", fullWidth: true },
    ];
  }

  if (tabla === "convenios_redes") {
    return [
      { key: "codificacion", label: "Codificación / RNI" },
      { key: "red_nombre", label: "Nombre de la Red" },
      { key: "pais", label: "País" },
      { key: "ciudad_pais", label: "Ciudad / País" },
      { key: "convenio_digital", label: "Convenio Digital", type: "select", options: ["SI", "NO"] },
      { key: "convenio_fisico", label: "Convenio Físico", type: "select", options: ["SI", "NO"] },
      { key: "tipo_convenio", label: "Tipo Convenio" },
      { key: "contacto", label: "Contacto / Representante" },
      { key: "correo_electronico", label: "Correo Electrónico de Contacto" },
      { key: "vigencia_desde_original", label: "Vigencia Desde (Original)", type: "date" },
      { key: "vigencia_hasta_original", label: "Vigencia Hasta (Original)", type: "date" },
      { key: "vigencia_desde_actual", label: "Vigencia Desde (Actual)", type: "date" },
      { key: "vigencia_hasta_actual", label: "Vigencia Hasta (Actual)", type: "date" },
      { key: "estado_general", label: "Estado General", type: "select", options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
      { key: "duracion", label: "Duración / Término" },
      { key: "persona_registra", label: "Persona que Registra" },
      { key: "objetivo", label: "Objetivo / Alcance de la Red", type: "textarea", fullWidth: true },
      { key: "observaciones", label: "Observaciones Adicionales / Enlace", type: "textarea", fullWidth: true },
    ];
  }

  if (tabla === "convenios_investigacion") {
    return [
      { key: "codificacion", label: "Codificación / RNI" },
      { key: "universidad_entidad", label: "Universidad / Entidad Contraparte" },
      { key: "nombre_convenio", label: "Nombre del Convenio / Proyecto" },
      { key: "pais", label: "País" },
      { key: "ciudad_pais", label: "Ciudad / País" },
      { key: "convenio_digital", label: "Convenio Digital", type: "select", options: ["SI", "NO"] },
      { key: "convenio_fisico", label: "Convenio Físico", type: "select", options: ["SI", "NO"] },
      { key: "tipo_convenio", label: "Tipo Convenio" },
      { key: "contacto", label: "Contacto / Investigador Principal" },
      { key: "correo_electronico", label: "Correo Electrónico de Contacto" },
      { key: "vigencia_desde_original", label: "Vigencia Desde (Original)", type: "date" },
      { key: "vigencia_hasta_original", label: "Vigencia Hasta (Original)", type: "date" },
      { key: "vigencia_desde_actual", label: "Vigencia Desde (Actual)", type: "date" },
      { key: "vigencia_hasta_actual", label: "Vigencia Hasta (Actual)", type: "date" },
      { key: "estado_general", label: "Estado General", type: "select", options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
      { key: "duracion", label: "Duración / Término" },
      { key: "persona_registra", label: "Persona que Registra" },
      { key: "objetivo", label: "Objetivo del Convenio", type: "textarea", fullWidth: true },
      { key: "observaciones", label: "Observaciones Adicionales / Enlace", type: "textarea", fullWidth: true },
    ];
  }

  if (tabla === "convenios_nacionales") {
    return [
      { key: "codigo", label: "Código / Ref RNI" },
      { key: "universidad_entidad", label: "Universidad / Entidad Contraparte" },
      { key: "ciudad", label: "Ciudad" },
      { key: "convenio_digital", label: "Convenio Digital", type: "select", options: ["SI", "NO"] },
      { key: "convenio_fisico", label: "Convenio Físico", type: "select", options: ["SI", "NO"] },
      { key: "tipo_convenio_intercambio", label: "Tipo Convenio / Intercambio" },
      { key: "tipo_convenio", label: "Tipo Convenio", type: "select", options: ["MARCO", "ESPECIFICO", "OTROS SI"] },
      { key: "contacto_ori", label: "Contacto ORI / Institucional" },
      { key: "correo_electronico", label: "Correo Electrónico de Contacto" },
      { key: "vigencia_desde_original", label: "Vigencia Desde (Original)", type: "date" },
      { key: "vigencia_hasta_original", label: "Vigencia Hasta (Original)", type: "date" },
      { key: "vigencia_desde_actual", label: "Vigencia Desde (Actual)", type: "date" },
      { key: "vigencia_hasta_actual", label: "Vigencia Hasta (Actual)", type: "date" },
      { key: "estado_general", label: "Estado General", type: "select", options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
      { key: "duracion", label: "Duración / Término" },
      { key: "persona_registra", label: "Persona que Registra" },
      { key: "estado_preventivo", label: "Estado Preventivo" },
      { key: "objetivo", label: "Objetivo del Convenio", type: "textarea", fullWidth: true },
      { key: "observaciones", label: "Observaciones Adicionales / Enlace", type: "textarea", fullWidth: true },
    ];
  }

  // Default: convenios_internacionales_vigentes and convenios_internacionales
  return [
    { key: "codificacion", label: "Codificación / RNI" },
    { key: "universidad", label: "Universidad / Institución Contraparte" },
    { key: "pais", label: "País" },
    { key: "ciudad_pais", label: "Ciudad / País" },
    { key: "convenio_digital", label: "Convenio Digital", type: "select", options: ["SI", "NO"] },
    { key: "convenio_fisico", label: "Convenio Físico", type: "select", options: ["SI", "NO"] },
    { key: "tipo_convenio_intercambio", label: "Tipo Convenio / Intercambio" },
    { key: "tipo_convenio", label: "Tipo Convenio", type: "select", options: ["MARCO", "ESPECIFICO", "OTROS SI"] },
    { key: "contacto_ori", label: "Contacto ORI / Universidad" },
    { key: "correo_electronico", label: "Correo Electrónico de Contacto" },
    { key: "vigencia_desde_original", label: "Vigencia Desde (Original)", type: "date" },
    { key: "vigencia_hasta_original", label: "Vigencia Hasta (Original)", type: "date" },
    { key: "vigencia_desde_actual", label: "Vigencia Desde (Actual)", type: "date" },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta (Actual)", type: "date" },
    { key: "estado_general", label: "Estado General", type: "select", options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
    { key: "duracion", label: "Duración / Término" },
    { key: "persona_registra", label: "Persona que Registra" },
    { key: "estado_preventivo", label: "Estado Preventivo" },
    { key: "objetivo", label: "Objetivo del Convenio", type: "textarea", fullWidth: true },
    { key: "observaciones", label: "Observaciones Adicionales / Enlace", type: "textarea", fullWidth: true },
  ];
}

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
  
  const [sendingRealEmail, setSendingRealEmail] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<string | null>(null);

  const fieldSpecs = getFieldSpecsForTable(tabla);

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

  // Send email with the REAL DATA of this specific agreement
  const handleSendRealNotification = async () => {
    setSendingRealEmail(true);
    setEmailResult(null);

    try {
      const res = await fetch("/api/cron/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convenioId: id,
          tabla,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailResult(`¡Alerta enviada exitosamente con los datos de: ${data.item || 'este convenio'} a ${data.recipients?.join(', ')}!`);
      } else {
        setEmailResult(`Error: ${data.error || "No se pudo enviar el correo."}`);
      }
    } catch (e: any) {
      setEmailResult(`Error: ${e.message}`);
    } finally {
      setSendingRealEmail(false);
    }
  };

  // Send generic test demo email
  const handleSendTestNotification = async () => {
    setSendingTestEmail(true);
    setEmailResult(null);

    try {
      const res = await fetch("/api/cron/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailResult("¡Correo de prueba (Demo) enviado exitosamente!");
      } else {
        setEmailResult(`Error: ${data.error || "No se pudo enviar el correo de prueba."}`);
      }
    } catch (e: any) {
      setEmailResult(`Error: ${e.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Cargando detalles completos del convenio...
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
              {tabla.replace(/_/g, " ").toUpperCase()}
            </span>
            <h1 className="text-xl font-bold text-white mt-2">
              {convenio.universidad || convenio.universidad_entidad || convenio.red_nombre || convenio.institucion || convenio.nombre_convenio || "Detalle del Convenio"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Código / Ref: {convenio.codificacion || convenio.codigo || convenio.item || "Sin Código"}
            </p>
          </div>

          <div className="text-right">
            <span className={`badge ${(convenio.estado_general === 'VIGENTE' || convenio.estado_tramite) ? 'badge-success' : 'badge-danger'}`}>
              {convenio.estado_general || convenio.estado_tramite || 'SIN ESTADO'}
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

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-blue-400">🔵 2 Meses</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_60dias !== false}
              onChange={(e) => handleChange("notificacion_60dias", e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-blue-300">🔵 1 Mes</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_30dias !== false}
              onChange={(e) => handleChange("notificacion_30dias", e.target.checked)}
              className="w-4 h-4 accent-blue-400"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-yellow-400">🟡 15 Días</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_15dias !== false}
              onChange={(e) => handleChange("notificacion_15dias", e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-amber-400">🟠 5 Días</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_5dias !== false}
              onChange={(e) => handleChange("notificacion_5dias", e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
          </label>

          <label className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex flex-col justify-between gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-red-400">🔴 1 Día</span>
            <input
              type="checkbox"
              checked={convenio.notificacion_1dia !== false}
              onChange={(e) => handleChange("notificacion_1dia", e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
          </label>
        </div>

        {/* Action Buttons for Emailing */}
        <div className="pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Envía una notificación por correo formal a la cuenta oficial de la ORI:
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSendRealNotification}
              disabled={sendingRealEmail}
              className="btn btn-gold text-xs py-2 px-3.5 flex items-center justify-center gap-1.5 shadow font-semibold w-full sm:w-auto"
            >
              <MailCheck className="w-4 h-4" />
              <span>{sendingRealEmail ? "Enviando Alerta..." : "Enviar Alerta de ESTE Convenio"}</span>
            </button>

            <button
              onClick={handleSendTestNotification}
              disabled={sendingTestEmail}
              className="btn btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 text-slate-300 w-full sm:w-auto"
            >
              <Send className="w-3.5 h-3.5 text-slate-400" />
              <span>{sendingTestEmail ? "Enviando..." : "Correo Prueba (Demo)"}</span>
            </button>
          </div>
        </div>

        {emailResult && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{emailResult}</span>
          </div>
        )}
      </div>

      {/* Editable Fields Form (Dynamic for EVERY table column) */}
      <div className="glass-card space-y-6">
        <h2 className="text-base font-bold text-white border-b border-[#334155] pb-2">
          Datos Generales y Específicos del Convenio ({tabla.replace(/_/g, " ").toUpperCase()})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldSpecs.map((spec) => (
            <div key={spec.key} className={spec.fullWidth ? "md:col-span-2" : ""}>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {spec.label}
              </label>

              {spec.type === "select" && spec.options ? (
                <select
                  value={convenio[spec.key] || spec.options[0]}
                  onChange={(e) => handleChange(spec.key, e.target.value)}
                  className="form-input"
                >
                  {spec.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : spec.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={convenio[spec.key] || ""}
                  onChange={(e) => handleChange(spec.key, e.target.value)}
                  placeholder={`Ingrese ${spec.label.toLowerCase()}...`}
                  className="form-input"
                />
              ) : (
                <input
                  type={spec.type || "text"}
                  value={convenio[spec.key] !== null && convenio[spec.key] !== undefined ? convenio[spec.key] : ""}
                  onChange={(e) => handleChange(spec.key, e.target.value)}
                  placeholder={`Ingrese ${spec.label.toLowerCase()}...`}
                  className="form-input"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
