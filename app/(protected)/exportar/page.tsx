"use client";

import { Download, FileSpreadsheet, CheckCircle, ShieldCheck } from "lucide-react";

export default function ExportarPage() {
  const handleDownload = () => {
    window.location.href = "/api/exportar";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Exportar Matriz Actualizada (.xlsx)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Descargue la matriz de convenios ORI en formato original Excel de 6 pestañas, con todos los datos y modificaciones reflejados en tiempo real.
        </p>
      </div>

      <div className="glass-card space-y-6 text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-blue-600 mx-auto flex items-center justify-center text-white shadow-xl">
          <FileSpreadsheet className="w-8 h-8 text-amber-200" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Matriz Gestión y Control de Convenios ORI 2026</h2>
          <p className="text-xs text-slate-400 mt-1">
            Incluye las 6 hojas: Int. Vigentes, IES Nacionales, IES Internacionales, En Trámite, REDES e Investigación.
          </p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#334155] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Garantía de integridad de datos</span>
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
            <li>Todos los cambios editados en línea están incluidos.</li>
            <li>Formato idéntico al requerimiento de la Universidad Mariana.</li>
            <li>Fechas y códigos formateados para auditoría.</li>
          </ul>
        </div>

        <button
          onClick={handleDownload}
          className="btn btn-gold py-3 px-8 text-sm shadow-xl inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Matriz Excel (.xlsx)</span>
        </button>
      </div>
    </div>
  );
}
