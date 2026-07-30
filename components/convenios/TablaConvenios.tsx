"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Check,
  Edit2,
  Search,
  Bell,
  BellOff,
  ExternalLink,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Column {
  key: string;
  label: string;
  type?: "text" | "date" | "select" | "number";
  options?: string[];
  editable?: boolean;
}

interface TablaConveniosProps {
  tabla: string;
  columns: Column[];
  initialData: any[];
  idKey?: string;
  title: string;
  subtitle?: string;
}

export default function TablaConvenios({
  tabla,
  columns,
  initialData,
  idKey = "id",
  title,
  subtitle,
}: TablaConveniosProps) {
  const [data, setData] = useState<any[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState<any>("");
  const [savedCell, setSavedCell] = useState<{ id: string; key: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Global Action Feedback Toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const supabase = createClient();

  const triggerToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Filtered data based on search
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handleCellClick = (id: string, key: string, currentValue: any, editable?: boolean) => {
    if (editable === false) return;
    setEditingCell({ id, key });
    setEditValue(currentValue ?? "");
  };

  const handleSaveInline = async (id: string, key: string) => {
    setEditingCell(null);

    // Update local state instantly
    setData((prev) =>
      prev.map((row) => (row[idKey] === id ? { ...row, [key]: editValue } : row))
    );

    // Show checkmark animation
    setSavedCell({ id, key });
    setTimeout(() => setSavedCell(null), 2000);

    // Persist to Supabase
    await supabase.from(tabla).update({ [key]: editValue }).eq(idKey, id);
    triggerToast("Campo actualizado correctamente.");
  };

  const toggleNotifications = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setData((prev) =>
      prev.map((row) => (row[idKey] === id ? { ...row, notificaciones_activas: newVal } : row))
    );
    await supabase.from(tabla).update({ notificaciones_activas: newVal }).eq(idKey, id);
    triggerToast(newVal ? "Notificaciones activadas para este convenio." : "Notificaciones desactivadas para este convenio.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este convenio permanentemente?")) return;
    setData((prev) => prev.filter((row) => row[idKey] !== id));
    await supabase.from(tabla).delete().eq(idKey, id);
    triggerToast("Convenio eliminado correctamente.");
  };

  const handleCreateNewRow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNew(true);

    try {
      // Clean and set default values
      const payload: Record<string, any> = {
        ...newRowData,
        estado_general: newRowData.estado_general || "VIGENTE",
        notificaciones_activas: true,
        notificacion_60dias: true,
        notificacion_30dias: true,
        notificacion_15dias: true,
        notificacion_5dias: true,
        notificacion_1dia: true,
      };

      const { data: created, error } = await supabase.from(tabla).insert(payload).select().single();

      if (error) {
        alert("Error al crear convenio: " + error.message);
      } else if (created) {
        // Prepend new row to table data instantly
        setData([created, ...data]);
        setShowCreateModal(false);
        setNewRowData({});
        triggerToast("¡Nuevo convenio registrado exitosamente!");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] border border-amber-500/40 text-amber-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, universidad, país..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <span className="text-xs font-semibold text-slate-400 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-[#334155]">
            {filteredData.length} registros
          </span>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Convenio</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-10 text-center">Notif.</th>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th className="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron convenios registrados.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const id = row[idKey];
                const notifActive = row.notificaciones_activas !== false;

                return (
                  <tr key={id}>
                    {/* Notification toggle */}
                    <td className="text-center">
                      <button
                        onClick={() => toggleNotifications(id, notifActive)}
                        className={`p-1.5 rounded-md transition-colors ${
                          notifActive
                            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                            : "bg-slate-700/50 text-slate-500 hover:bg-slate-700"
                        }`}
                        title={notifActive ? "Notificaciones Activas (clic para desactivar)" : "Notificaciones Inactivas"}
                      >
                        {notifActive ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Dynamic Columns */}
                    {columns.map((col) => {
                      const isEditing = editingCell?.id === id && editingCell?.key === col.key;
                      const isSaved = savedCell?.id === id && savedCell?.key === col.key;
                      const value = row[col.key];

                      return (
                        <td key={col.key}>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              {col.type === "select" && col.options ? (
                                <select
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleSaveInline(id, col.key)}
                                  className="bg-[#0f172a] text-white text-xs border border-amber-500 rounded px-2 py-1"
                                >
                                  {col.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  autoFocus
                                  type={col.type || "text"}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveInline(id, col.key);
                                  }}
                                  onBlur={() => handleSaveInline(id, col.key)}
                                  className="bg-[#0f172a] text-white text-xs border border-amber-500 rounded px-2 py-1 w-full"
                                />
                              )}
                            </div>
                          ) : (
                            <div
                              onClick={() => handleCellClick(id, col.key, value, col.editable)}
                              className={`editable-cell group flex items-center justify-between gap-1 ${
                                isSaved ? "bg-emerald-500/20 text-emerald-300" : ""
                              }`}
                            >
                              <span className="truncate max-w-[220px]">
                                {value !== null && value !== undefined ? String(value) : "—"}
                              </span>
                              {isSaved ? (
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Row Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/convenios/${tabla}/${id}`}
                          className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          title="Ver detalle completo / Editar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(id)}
                          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Eliminar convenio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e293b] p-3 rounded-xl border border-[#334155] text-xs text-slate-400">
          <div>
            Mostrando <span className="text-white font-semibold">{startIndex + 1}</span> a{" "}
            <span className="text-white font-semibold">
              {Math.min(startIndex + pageSize, filteredData.length)}
            </span>{" "}
            de <span className="text-white font-semibold">{filteredData.length}</span> convenios
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="btn btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <span className="px-2 font-semibold text-white">
              Página {validCurrentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="btn btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-[#334155] bg-gradient-to-r from-[#1a2e5a] to-[#0f172a]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Registrar Nuevo Convenio ({title})
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRow} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.map((col) => (
                  <div key={col.key} className={col.key === "objetivo" || col.key === "observaciones" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {col.label}
                    </label>

                    {col.type === "select" && col.options ? (
                      <select
                        value={newRowData[col.key] || col.options[0]}
                        onChange={(e) => setNewRowData({ ...newRowData, [col.key]: e.target.value })}
                        className="form-input"
                      >
                        {col.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : col.key === "objetivo" || col.key === "observaciones" ? (
                      <textarea
                        rows={3}
                        value={newRowData[col.key] || ""}
                        onChange={(e) => setNewRowData({ ...newRowData, [col.key]: e.target.value })}
                        placeholder={`Ingrese ${col.label.toLowerCase()}...`}
                        className="form-input"
                      />
                    ) : (
                      <input
                        type={col.type || "text"}
                        value={newRowData[col.key] || ""}
                        onChange={(e) => setNewRowData({ ...newRowData, [col.key]: e.target.value })}
                        placeholder={`Ej: ${col.label}...`}
                        className="form-input"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="btn btn-gold text-xs py-2 px-5 shadow font-semibold"
                >
                  {isSubmittingNew ? "Guardando..." : "Crear Convenio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
