"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, Edit2, Search, Bell, BellOff, ExternalLink, Trash2 } from "lucide-react";
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
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState<any>("");
  const [savedCell, setSavedCell] = useState<{ id: string; key: string } | null>(null);
  const supabase = createClient();

  // Filtered data based on search
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCellClick = (id: string, key: string, currentValue: any, editable?: boolean) => {
    if (editable === false) return;
    setEditingCell({ id, key });
    setEditValue(currentValue ?? "");
  };

  const handleSave = async (id: string, key: string) => {
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
  };

  const toggleNotifications = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setData((prev) =>
      prev.map((row) => (row[idKey] === id ? { ...row, notificaciones_activas: newVal } : row))
    );
    await supabase.from(tabla).update({ notificaciones_activas: newVal }).eq(idKey, id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este convenio?")) return;
    setData((prev) => prev.filter((row) => row[idKey] !== id));
    await supabase.from(tabla).delete().eq(idKey, id);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <span className="text-xs font-semibold text-slate-400 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-[#334155]">
            {filteredData.length} registros
          </span>
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron convenios.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
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

                    {/* Columns */}
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
                                  onBlur={() => handleSave(id, col.key)}
                                  className="bg-[#0f172a] text-white text-xs border border-blue-500 rounded px-2 py-1"
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
                                    if (e.key === "Enter") handleSave(id, col.key);
                                  }}
                                  onBlur={() => handleSave(id, col.key)}
                                  className="bg-[#0f172a] text-white text-xs border border-blue-500 rounded px-2 py-1 w-full"
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
                              <span className="truncate max-w-[200px]">
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

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/convenios/${tabla}/${id}`}
                          className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          title="Ver detalle completo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(id)}
                          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Eliminar registro"
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
    </div>
  );
}
