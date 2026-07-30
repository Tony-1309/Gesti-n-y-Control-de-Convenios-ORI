"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Bell,
  Send,
  CheckCircle2,
  Plus,
  X,
  Clock,
  Filter,
  LayoutGrid,
  Sparkles,
  Save,
  Check,
} from "lucide-react";

export default function ConfiguracionPage() {
  const [emails, setEmails] = useState<string[]>(["relacionconvenios@umariana.edu.co"]);
  const [newEmail, setNewEmail] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const [sendingTest, setSendingTest] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  // Channels, Schedule, Format & Category preferences
  const [canalEmail, setCanalEmail] = useState(true);
  const [canalDashboard, setCanalDashboard] = useState(true);
  const [horaEnvio, setHoraEnvio] = useState("08:00");
  const [frecuenciaEnvio, setFrecuenciaEnvio] = useState("diario");
  const [formatoEnvio, setFormatoEnvio] = useState<"consolidado" | "individual">("consolidado");

  const [categoriasActivas, setCategoriasActivas] = useState<string[]>([
    "convenios_internacionales_vigentes",
    "convenios_nacionales",
    "convenios_internacionales",
    "convenios_tramite",
    "convenios_redes",
    "convenios_investigacion",
  ]);

  const [bulkActionMessage, setBulkActionMessage] = useState<string | null>(null);
  const [loadingBulk, setLoadingBulk] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/configuracion");
        const data = await res.json();
        if (data.config) {
          const cfg = data.config;
          if (Array.isArray(cfg.emails_notificacion)) setEmails(cfg.emails_notificacion);
          if (typeof cfg.canal_email_activo === "boolean") setCanalEmail(cfg.canal_email_activo);
          if (typeof cfg.canal_dashboard_activo === "boolean") setCanalDashboard(cfg.canal_dashboard_activo);
          if (cfg.hora_envio_colombia) setHoraEnvio(cfg.hora_envio_colombia);
          if (cfg.frecuencia_envio) setFrecuenciaEnvio(cfg.frecuencia_envio);
          if (cfg.formato_envio) setFormatoEnvio(cfg.formato_envio);
          if (Array.isArray(cfg.categorias_activas)) setCategoriasActivas(cfg.categorias_activas);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadConfig();
  }, []);

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    if (!newEmail.includes("@")) {
      alert("Por favor ingrese un correo electrónico válido.");
      return;
    }
    if (emails.includes(newEmail.trim())) return;

    setEmails([...emails, newEmail.trim()]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const toggleCategory = (catName: string) => {
    if (categoriasActivas.includes(catName)) {
      setCategoriasActivas(categoriasActivas.filter((c) => c !== catName));
    } else {
      setCategoriasActivas([...categoriasActivas, catName]);
    }
  };

  const handleSaveAllSettings = async () => {
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const fullConfig = {
        emails_notificacion: emails,
        canal_email_activo: canalEmail,
        canal_dashboard_activo: canalDashboard,
        hora_envio_colombia: horaEnvio,
        frecuencia_envio: frecuenciaEnvio,
        formato_envio: formatoEnvio,
        categorias_activas: categoriasActivas,
      };

      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: fullConfig }),
      });

      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      } else {
        alert("Error al guardar la configuración.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGlobalToggleThreshold = async (field: string, newValue: boolean) => {
    setLoadingBulk(field);
    setBulkActionMessage(null);

    try {
      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_toggle",
          bulkField: field,
          bulkValue: newValue,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBulkActionMessage(data.message || "Regla actualizada globalmente.");
        setTimeout(() => setBulkActionMessage(null), 4000);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingBulk(null);
    }
  };

  const handleTestEmail = async () => {
    setSendingTest(true);
    setTestMessage(null);

    try {
      const res = await fetch("/api/cron/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestMessage("¡Correo formal enviado con éxito a: " + (data.recipients?.join(", ") || emails.join(", ")) + "!");
      } else {
        setTestMessage("Error: " + (data.error || "No se pudo enviar el correo"));
      }
    } catch (e: any) {
      setTestMessage("Error: " + e.message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-[#1e293b] p-5 rounded-2xl border border-[#334155]">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Centro de Control & Preferencias
          </span>
          <h1 className="text-xl font-bold text-white mt-1.5">
            Configuración Personalizada de Alertas y Notificaciones
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalice el canal, horario, categorías, frecuencia y formato de entrega de alertas institucionales.
          </p>
        </div>

        <button
          onClick={handleSaveAllSettings}
          disabled={savingSettings}
          className="btn btn-gold text-xs py-2.5 px-5 shadow-lg flex items-center gap-2 font-semibold"
        >
          {settingsSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{savingSettings ? "Guardando..." : settingsSuccess ? "¡Guardado!" : "Guardar Preferencias"}</span>
        </button>
      </div>

      {/* 1. CANALES DE NOTIFICACIÓN (EL CÓMO) */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            1. Canales de Notificación (¿Cómo desea recibir las alertas?)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] flex items-start justify-between cursor-pointer hover:border-blue-500 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Notificaciones por Correo Electrónico</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Envía correos formales institucionales a través del servicio de Resend API.
              </p>
            </div>
            <input
              type="checkbox"
              checked={canalEmail}
              onChange={(e) => setCanalEmail(e.target.checked)}
              className="w-5 h-5 accent-amber-500 cursor-pointer mt-0.5"
            />
          </label>

          <label className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] flex items-start justify-between cursor-pointer hover:border-amber-500 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Alertas en Dashboard y Plataforma</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Muestra tarjetas y badges de alerta en tiempo real dentro del panel central.
              </p>
            </div>
            <input
              type="checkbox"
              checked={canalDashboard}
              onChange={(e) => setCanalDashboard(e.target.checked)}
              className="w-5 h-5 accent-amber-500 cursor-pointer mt-0.5"
            />
          </label>
        </div>
      </div>

      {/* 2. HORARIO Y FRECUENCIA DE ENVÍO (EL A QUÉ HORA) */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">
            2. Horario & Frecuencia de Envío Automático (Zona Horaria Colombia UTC-5)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hora Preferida de Envío Diario
            </label>
            <select
              value={horaEnvio}
              onChange={(e) => setHoraEnvio(e.target.value)}
              className="form-input text-xs"
            >
              <option value="06:00">06:00 AM (Madrugada)</option>
              <option value="07:00">07:00 AM (Inicio de Jornada)</option>
              <option value="08:00">08:00 AM (Recomendado ORI)</option>
              <option value="09:00">09:00 AM (Mañana)</option>
              <option value="12:00">12:00 PM (Mediodía)</option>
              <option value="14:00">02:00 PM (Tarde)</option>
              <option value="17:00">05:00 PM (Cierre de Jornada)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Frecuencia de Envío
            </label>
            <select
              value={frecuenciaEnvio}
              onChange={(e) => setFrecuenciaEnvio(e.target.value)}
              className="form-input text-xs"
            >
              <option value="diario">Todos los Días (Lunes a Domingo)</option>
              <option value="lunes_a_viernes">Días Hábiles (Lunes a Viernes)</option>
              <option value="solo_dias_umbral">Solo en Días Exactos de Umbral (60d, 30d, 15d, 5d, 1d)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. FILTRO POR CATEGORÍAS (DE QUÉ CATEGORÍAS) */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">
              3. Selección de Categorías a Notificar (¿De qué hojas desea recibir alertas?)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCategoriasActivas([
                "convenios_internacionales_vigentes",
                "convenios_nacionales",
                "convenios_internacionales",
                "convenios_tramite",
                "convenios_redes",
                "convenios_investigacion",
              ])}
              className="text-blue-400 hover:underline"
            >
              Marcar Todas
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setCategoriasActivas([])}
              className="text-slate-400 hover:underline"
            >
              Desmarcar Todas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: "convenios_internacionales_vigentes", label: "Convenios Int. Vigentes" },
            { id: "convenios_nacionales", label: "Convenios IES Nacionales" },
            { id: "convenios_internacionales", label: "Convenios IES Internacionales" },
            { id: "convenios_tramite", label: "Convenios en Trámite" },
            { id: "convenios_redes", label: "Convenios de REDES" },
            { id: "convenios_investigacion", label: "Convenios de Investigación" },
          ].map((cat) => {
            const isChecked = categoriasActivas.includes(cat.id);
            return (
              <label
                key={cat.id}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                  isChecked
                    ? "bg-blue-600/15 border-blue-500/40 text-white"
                    : "bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="font-semibold">{cat.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. FORMATO DE ENVÍO DE CORREO */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
          <LayoutGrid className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-white">
            4. Formato de Presentación del Correo Electrónico
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            onClick={() => setFormatoEnvio("consolidado")}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
              formatoEnvio === "consolidado"
                ? "bg-amber-500/10 border-amber-500 text-white"
                : "bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-600"
            }`}
          >
            <input
              type="radio"
              name="formato"
              checked={formatoEnvio === "consolidado"}
              onChange={() => setFormatoEnvio("consolidado")}
              className="w-4 h-4 accent-amber-500 mt-1 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-white">📋 Resumen Diario Consolidado (Recomendado ORI)</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Envía un único correo institucional al día agrupando todos los convenios por vencer en una tabla organizada por urgencia. Evita saturar la bandeja de entrada.
              </p>
            </div>
          </label>

          <label
            onClick={() => setFormatoEnvio("individual")}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
              formatoEnvio === "individual"
                ? "bg-amber-500/10 border-amber-500 text-white"
                : "bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-600"
            }`}
          >
            <input
              type="radio"
              name="formato"
              checked={formatoEnvio === "individual"}
              onChange={() => setFormatoEnvio("individual")}
              className="w-4 h-4 accent-amber-500 mt-1 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-white">📩 Correos Individuales por Convenio</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Envía un correo electrónico independiente y dedicado por cada convenio que alcance un umbral de vencimiento.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 5. RECEPTORES DE CORREOS ELECTRÓNICOS */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              5. Correos Electrónicos Destinatarios de Alertas
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Todas las notificaciones automáticas y alertas se enviarán a las siguientes cuentas oficiales registradas:
        </p>

        {/* Add Email input */}
        <div className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Agregar nuevo correo (ej: relacionconvenios@umariana.edu.co)..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddEmail();
            }}
            className="form-input text-xs"
          />
          <button
            onClick={handleAddEmail}
            className="btn btn-secondary text-xs shrink-0 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* List of Email Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] px-3 py-1.5 rounded-lg text-xs text-white"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{email}</span>
              <button
                onClick={() => handleRemoveEmail(email)}
                className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                title="Eliminar correo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
          <span className="text-[11px] text-slate-400">
            Prueba de recepción de plantilla formal institucional:
          </span>
          <button
            onClick={handleTestEmail}
            disabled={sendingTest}
            className="btn btn-gold text-xs py-2 px-4 flex items-center gap-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? "Enviando..." : "Probar Envío por Correo"}</span>
          </button>
        </div>

        {testMessage && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{testMessage}</span>
          </div>
        )}
      </div>

      {/* 6. CONTROL GLOBAL DE UMBRALES DE DÍAS */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              6. Control Global de Umbrales de Días (Activar / Desactivar Masivo)
            </h2>
          </div>
          {bulkActionMessage && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {bulkActionMessage}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Rule 1: 2 Meses */}
          <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-info">🔵 2 Meses (60 Días)</span>
                <span className="text-xs font-bold text-white">Primera Alerta Preventiva</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Notifica con 60 días de anticipación para iniciar acercamiento institucional.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_60dias", true)}
                disabled={loadingBulk === "notificacion_60dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-blue-500"
              >
                Activar Todos
              </button>
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_60dias", false)}
                disabled={loadingBulk === "notificacion_60dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-red-500 text-slate-400"
              >
                Desactivar Todos
              </button>
            </div>
          </div>

          {/* Rule 2: 1 Mes */}
          <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-info">🔵 1 Mes (30 Días)</span>
                <span className="text-xs font-bold text-white">Segunda Alerta Preventiva</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Notifica a 30 días del vencimiento para confirmar prórroga o no renovación.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_30dias", true)}
                disabled={loadingBulk === "notificacion_30dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-blue-500"
              >
                Activar Todos
              </button>
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_30dias", false)}
                disabled={loadingBulk === "notificacion_30dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-red-500 text-slate-400"
              >
                Desactivar Todos
              </button>
            </div>
          </div>

          {/* Rule 3: 15 Días */}
          <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-caution">🟡 15 Días</span>
                <span className="text-xs font-bold text-white">Tercera Alerta de Control</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Notifica a 15 días del vencimiento para seguimiento activo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_15dias", true)}
                disabled={loadingBulk === "notificacion_15dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-yellow-500"
              >
                Activar Todos
              </button>
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_15dias", false)}
                disabled={loadingBulk === "notificacion_15dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-red-500 text-slate-400"
              >
                Desactivar Todos
              </button>
            </div>
          </div>

          {/* Rule 4: 5 Días */}
          <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-warning">🟠 5 Días</span>
                <span className="text-xs font-bold text-white">Alerta Urgente</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Notifica faltar 5 días con indicación prioritaria.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_5dias", true)}
                disabled={loadingBulk === "notificacion_5dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-amber-500"
              >
                Activar Todos
              </button>
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_5dias", false)}
                disabled={loadingBulk === "notificacion_5dias"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-red-500 text-slate-400"
              >
                Desactivar Todos
              </button>
            </div>
          </div>

          {/* Rule 5: 1 Día */}
          <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-danger">🔴 1 Día</span>
                <span className="text-xs font-bold text-white">Alerta Crítica Final</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Notifica el día anterior al vencimiento formal del acuerdo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_1dia", true)}
                disabled={loadingBulk === "notificacion_1dia"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-red-500"
              >
                Activar Todos
              </button>
              <button
                onClick={() => handleGlobalToggleThreshold("notificacion_1dia", false)}
                disabled={loadingBulk === "notificacion_1dia"}
                className="btn btn-secondary text-xs py-1 px-2.5 hover:border-red-500 text-slate-400"
              >
                Desactivar Todos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
