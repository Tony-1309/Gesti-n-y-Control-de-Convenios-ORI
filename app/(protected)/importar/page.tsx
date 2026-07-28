"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, Layers } from "lucide-react";

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", importMode);

    try {
      const res = await fetch("/api/importar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la matriz.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Importar Matriz de Convenios (.xlsx)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Actualice o cargue una nueva matriz Excel manteniendo la coherencia con la base de datos de la ORI.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="glass-card space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Seleccione el Método de Importación</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            onClick={() => setImportMode("merge")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              importMode === "merge"
                ? "bg-blue-600/20 border-blue-500 text-white"
                : "bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Fusionar / Actualizar Modificados (Recomendado)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Identifica los campos modificados en la matriz y los actualiza en la base de datos sin borrar registros existentes.
            </p>
          </label>

          <label
            onClick={() => setImportMode("replace")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              importMode === "replace"
                ? "bg-amber-500/20 border-amber-500 text-white"
                : "bg-[#0f172a] border-[#334155] text-slate-400 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Reemplazar Toda la Información</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Limpia la base de datos e inserta íntegramente la nueva información contenida en el archivo subido.
            </p>
          </label>
        </div>
      </div>

      {/* Upload Box */}
      <div className="glass-card space-y-4">
        <div className="border-2 border-dashed border-[#334155] rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
          <FileSpreadsheet className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">
            {file ? file.name : "Seleccione o arrastre el archivo de la Matriz (.xlsx)"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Formatos soportados: .xlsx, .xls
          </p>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            id="matrix-upload-input"
          />
          <label
            htmlFor="matrix-upload-input"
            className="btn btn-secondary text-xs mt-4 inline-flex cursor-pointer"
          >
            Seleccionar Archivo
          </label>
        </div>

        {file && (
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-gold text-xs shadow-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Procesando Matriz..." : "Iniciar Importación"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Matriz importada con éxito</span>
          </div>
          <p>La base de datos fue actualizada respetando la configuración elegida.</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
