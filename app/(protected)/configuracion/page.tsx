"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Bell,
  Send,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";

export default function ConfiguracionPage() {
  const [emails, setEmails] = useState<string[]>(["relacionconvenios@umariana.edu.co"]);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmails, setSavingEmails] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);

  const [sendingTest, setSendingTest] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  // Global threshold toggles status
  const [ruleToggles, setRuleToggles] = useState({
    notificacion_60dias: true,
    notificacion_30dias: true,
    notificacion_15dias: true,
    notificacion_5dias: true,
    notificacion_1dia: true,
  });

  const [bulkActionMessage, setBulkActionMessage] = useState<string | null>(null);
  const [loadingBulk, setLoadingBulk] = useState<string | null>(null);

  useEffect(() => {
    // Load config from API
    async function loadConfig() {
      try {
        const res = await fetch("/api/configuracion");
        const data = await res.json();
        if (data.config && Array.isArray(data.config.emails_notificacion)) {
          setEmails(data.config.emails_notificacion);
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

  const handleSaveEmails = async () => {
    setSavingEmails(true);
    setEmailSaveSuccess(false);

    try {
      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails_notificacion: emails }),
      });
      if (res.ok) {
        setEmailSaveSuccess(true);
        setTimeout(() => setEmailSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEmails(false);
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
        setRuleToggles((prev: any) => ({ ...prev, [field]: newValue }));
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
      <div>
        <h1 className="text-xl font-bold text-white">Configuración del Sistema & Control de Alertas</h1>
        <p className="text-xs text-slate-400 mt-1">
          Gestione las reglas de notificación automática, receptores de correos e integración con Resend.
        </p>
      </div>

      {/* Recipient Emails Manager Card */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Correos Electrónicos Destinatarios de Alertas (Resend)
            </h2>
          </div>

          {emailSaveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Lista guardada
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Todas las alertas automáticas formales de vencimiento (2 meses, 1 mes, 15 días, 5 días y 1 día) se enviarán a los siguientes correos registrados:
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

        <div className="flex items-center justify-between pt-2 border-t border-[#334155]">
          <button
            onClick={handleSaveEmails}
            disabled={savingEmails}
            className="btn btn-primary text-xs py-2 px-4 shadow"
          >
            {savingEmails ? "Guardando..." : "Guardar Lista de Correos"}
          </button>

          <button
            onClick={handleTestEmail}
            disabled={sendingTest}
            className="btn btn-gold text-xs py-2 px-4 flex items-center gap-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? "Enviando..." : "Probar Envio Formal por Correo"}</span>
          </button>
        </div>

        {testMessage && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{testMessage}</span>
          </div>
        )}
      </div>

      {/* Global Rules & Threshold Controls */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Reglas de Notificación Automática (Control Global)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Permite activar o desactivar alertas de forma masiva para todos los convenios.
          </span>
        </div>

        {bulkActionMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bulkActionMessage}</span>
          </div>
        )}

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
