"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, ShieldAlert, ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Credenciales incorrectas. Verifique su correo y contraseña."
        : error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-[#334155] rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-900 mx-auto flex items-center justify-center text-white shadow-xl mb-4 border border-amber-400/30">
            <BookOpen className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">UNIVERSIDAD MARIANA</h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-1">
            Oficina de Relaciones Internacionales (ORI)
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Sistema de Gestión & Control de Convenios 2026
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@umariana.edu.co"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Iniciar Sesión Segura</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#334155] text-center">
          <p className="text-[11px] text-slate-500">
            Acceso restringido para personal autorizado de la ORI.
          </p>
        </div>
      </div>
    </div>
  );
}
