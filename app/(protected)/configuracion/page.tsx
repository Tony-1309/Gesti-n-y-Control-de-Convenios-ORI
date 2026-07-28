"use client";

import { useState } from "react";
import { Settings, Mail, Bell, ShieldCheck, Send, CheckCircle2 } from "lucide-react";

export default function ConfiguracionPage() {
  const [emailTo, setEmailTo] = useState("salcedoantony1309@gmail.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const handleTestEmail = async () => {
    setSendingTest(true);
    setTestMessage(null);

    try {
      const res = await fetch("/api/cron/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, customEmail: emailTo }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestMessage("¡Correo de notificación de prueba enviado correctamente a " + emailTo + "!");
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Configuración del Sistema y Notificaciones</h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajustes globales de envío de alertas, claves de API y parámetros de vencimiento.
        </p>
      </div>

      {/* Resend Integration Card */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
          <Mail className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Servicio de Correos Eletrónicos (Resend API)</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Correo Electrónico Destinatario de Alertas
            </label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200">Estado de Resend API Key</p>
              <p className="text-[11px] text-emerald-400 font-mono">Conectado (re_j9k...11B)</p>
            </div>
            <button
              onClick={handleTestEmail}
              disabled={sendingTest}
              className="btn btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingTest ? "Enviando..." : "Enviar Correo Prueba"}</span>
            </button>
          </div>

          {testMessage && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expiration Rules Info */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
          <Bell className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">Reglas de Notificación Automática Configuradas</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0f172a] border border-blue-500/30 text-center">
            <span className="text-lg font-bold text-blue-400 block">15 Días</span>
            <span className="text-[10px] text-slate-400">Primera Alerta</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0f172a] border border-yellow-500/30 text-center">
            <span className="text-lg font-bold text-yellow-400 block">10 Días</span>
            <span className="text-[10px] text-slate-400">Segunda Alerta</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0f172a] border border-amber-500/30 text-center">
            <span className="text-lg font-bold text-amber-400 block">5 Días</span>
            <span className="text-[10px] text-slate-400">Tercera Alerta</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0f172a] border border-red-500/30 text-center">
            <span className="text-lg font-bold text-red-400 block">1 Día</span>
            <span className="text-[10px] text-slate-400">Alerta Crítica</span>
          </div>
        </div>
      </div>
    </div>
  );
}
