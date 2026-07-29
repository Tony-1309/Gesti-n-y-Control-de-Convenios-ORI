import { createAdminClient } from "@/utils/supabase/server";

export interface ProximoVencerItem {
  id: string;
  codigo: string | null;
  institucion: string | null;
  pais: string | null;
  fecha_vencimiento: string;
  dias_restantes: number;
  estado_general: string | null;
  notificaciones_activas: boolean;
  notificacion_60dias: boolean;
  notificacion_30dias: boolean;
  notificacion_15dias: boolean;
  notificacion_5dias: boolean;
  notificacion_1dia: boolean;
  tabla_origen: string;
}

export async function getConveniosProximosVencer(maxDias: number = 65): Promise<ProximoVencerItem[]> {
  const supabase = createAdminClient();

  const tables = [
    { name: "convenios_internacionales_vigentes", dateCol: "vigencia_hasta_actual", nameCol: "universidad", codeCol: "codificacion" },
    { name: "convenios_nacionales", dateCol: "vigencia_hasta_actual", nameCol: "universidad_entidad", codeCol: "codigo" },
    { name: "convenios_internacionales", dateCol: "vigencia_hasta_actual", nameCol: "universidad", codeCol: "codificacion" },
    { name: "convenios_redes", dateCol: "vigencia_hasta_actual", nameCol: "red_nombre", codeCol: "codificacion" },
    { name: "convenios_investigacion", dateCol: "vigencia_hasta_actual", nameCol: "universidad_entidad", codeCol: "codificacion" },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results: ProximoVencerItem[] = [];

  for (const t of tables) {
    const { data } = await supabase
      .from(t.name)
      .select("*")
      .not(t.dateCol, "is", null);

    if (data) {
      for (const row of data) {
        if (row.notificaciones_activas === false) continue;
        const dateStr = row[t.dateCol];
        if (!dateStr) continue;

        const vencDate = new Date(dateStr.substring(0, 10) + "T00:00:00");
        if (isNaN(vencDate.getTime())) continue;

        const diffMs = vencDate.getTime() - today.getTime();
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (dias >= 0 && dias <= maxDias) {
          results.push({
            id: row.id,
            codigo: row[t.codeCol] || "N/A",
            institucion: row[t.nameCol] || "Convenio Sin Nombre",
            pais: row.pais || row.ciudad || row.ciudad_pais || "N/A",
            fecha_vencimiento: dateStr.substring(0, 10),
            dias_restantes: dias,
            estado_general: row.estado_general || "VIGENTE",
            notificaciones_activas: row.notificaciones_activas !== false,
            notificacion_60dias: row.notificacion_60dias !== false,
            notificacion_30dias: row.notificacion_30dias !== false,
            notificacion_15dias: row.notificacion_15dias !== false,
            notificacion_5dias: row.notificacion_5dias !== false,
            notificacion_1dia: row.notificacion_1dia !== false,
            tabla_origen: t.name,
          });
        }
      }
    }
  }

  // Deduplicate items by code or institution if present in multiple queries
  const seenKeys = new Set<string>();
  const uniqueResults: ProximoVencerItem[] = [];

  for (const item of results) {
    const key = `${item.tabla_origen}_${item.id}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    uniqueResults.push(item);
  }

  uniqueResults.sort((a, b) => a.dias_restantes - b.dias_restantes);
  return uniqueResults;
}
