import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

function parseDateVal(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().split("T")[0];
  }
  const str = String(val).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
  const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    const d = match[1].padStart(2, "0");
    const m = match[2].padStart(2, "0");
    const y = match[3];
    return `${y}-${m}-${d}`;
  }
  return null;
}

function cleanStr(val: any): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s ? s : null;
}

function cleanInt(val: any): number | null {
  if (val === null || val === undefined) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}

// Helper to deduplicate array of objects by a key
function deduplicate<T>(arr: T[], keyFn: (item: T) => string | null): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (k) {
      const lowerKey = k.toLowerCase().trim();
      if (seen.has(lowerKey)) continue;
      seen.add(lowerKey);
    }
    result.push(item);
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "merge"; // 'replace' or 'merge'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const supabase = createAdminClient();

    const summary: Record<string, number> = {};

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (!rows || rows.length === 0) continue;

      // 1. Convenios Int. vigentes
      if (sheetName.includes("Convenios Int. vigentes")) {
        const table = "convenios_internacionales_vigentes";
        if (mode === "replace") {
          await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const rawParsed = rows.slice(10).map((r: any) => ({
          codificacion: cleanStr(r[0]),
          convenio_digital: cleanStr(r[1]),
          convenio_fisico: cleanStr(r[2]),
          universidad: cleanStr(r[3]),
          pais: cleanStr(r[4]),
          ciudad_pais: cleanStr(r[5]),
          tipo_convenio_intercambio: cleanStr(r[6]),
          tipo_convenio: cleanStr(r[7]),
          contacto_ori: cleanStr(r[8]),
          correo_electronico: cleanStr(r[9]),
          vigencia_desde_original: parseDateVal(r[10]),
          vigencia_hasta_original: parseDateVal(r[11]),
          estado_general: cleanStr(r[12]),
          duracion: cleanStr(r[13]),
          objetivo: cleanStr(r[14]),
          persona_registra: cleanStr(r[15]),
          vigencia_desde_actual: parseDateVal(r[16]),
          vigencia_hasta_actual: parseDateVal(r[17]),
          estado_preventivo: cleanStr(r[19]),
          observaciones: cleanStr(r[20]),
          link_documento: cleanStr(r[21]),
        })).filter((r: any) => r.codificacion || r.universidad);

        const deduped = deduplicate(rawParsed, (r) => r.codificacion);

        if (mode === "replace") {
          const { data: inserted } = await supabase.from(table).insert(deduped).select();
          summary["Convenios Int. vigentes"] = inserted?.length || 0;
        } else {
          const { data: upserted } = await supabase.from(table).upsert(deduped, { onConflict: "codificacion" }).select();
          summary["Convenios Int. vigentes"] = upserted?.length || 0;
        }
      }

      // 2. Convenios IES Nacionales
      else if (sheetName.includes("Nacionales")) {
        const table = "convenios_nacionales";
        if (mode === "replace") {
          await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const rawParsed = rows.slice(9).map((r: any) => ({
          codigo: cleanStr(r[0]),
          numero: cleanInt(r[1]),
          convenio_digital: cleanStr(r[2]),
          convenio_fisico: cleanStr(r[3]),
          universidad_entidad: cleanStr(r[4]),
          ciudad: cleanStr(r[5]),
          tipo_convenio_intercambio: cleanStr(r[6]),
          contacto_ori: cleanStr(r[7]),
          correo_electronico: cleanStr(r[8]),
          vigencia_desde_original: parseDateVal(r[9]),
          vigencia_hasta_original: parseDateVal(r[10]),
          estado_general: cleanStr(r[11]),
          duracion: cleanStr(r[12]),
          objetivo: cleanStr(r[13]),
          persona_registra: cleanStr(r[14]),
          vigencia_desde_actual: parseDateVal(r[15]),
          vigencia_hasta_actual: parseDateVal(r[16]),
          estado_preventivo: cleanStr(r[18]),
          observaciones: cleanStr(r[19]),
          link_documento: cleanStr(r[20]),
        })).filter((r: any) => r.codigo || r.universidad_entidad);

        const deduped = deduplicate(rawParsed, (r) => r.codigo);

        if (mode === "replace") {
          const { data: inserted } = await supabase.from(table).insert(deduped).select();
          summary["Convenios IES Nacionales"] = inserted?.length || 0;
        } else {
          const { data: upserted } = await supabase.from(table).upsert(deduped, { onConflict: "codigo" }).select();
          summary["Convenios IES Nacionales"] = upserted?.length || 0;
        }
      }

      // 3. Convenios IES Internacionales
      else if (sheetName.includes("IES Internacionales")) {
        const table = "convenios_internacionales";
        if (mode === "replace") {
          await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const rawParsed = rows.slice(10).map((r: any) => ({
          codificacion: cleanStr(r[0]),
          convenio_digital: cleanStr(r[1]),
          convenio_fisico: cleanStr(r[2]),
          universidad: cleanStr(r[3]),
          pais: cleanStr(r[4]),
          ciudad_pais: cleanStr(r[5]),
          tipo_convenio_intercambio: cleanStr(r[6]),
          tipo_convenio: cleanStr(r[7]),
          contacto_ori: cleanStr(r[8]),
          correo_electronico: cleanStr(r[9]),
          vigencia_desde_original: parseDateVal(r[10]),
          vigencia_hasta_original: parseDateVal(r[11]),
          estado_general: cleanStr(r[12]),
          duracion: cleanStr(r[13]),
          objetivo: cleanStr(r[14]),
          persona_registra: cleanStr(r[15]),
          vigencia_desde_actual: parseDateVal(r[16]),
          vigencia_hasta_actual: parseDateVal(r[17]),
          estado_preventivo: cleanStr(r[19]),
          observaciones: cleanStr(r[20]),
          link_documento: cleanStr(r[21]),
        })).filter((r: any) => r.codificacion || r.universidad);

        const deduped = deduplicate(rawParsed, (r) => r.codificacion);

        if (mode === "replace") {
          const { data: inserted } = await supabase.from(table).insert(deduped).select();
          summary["Convenios IES Internacionales"] = inserted?.length || 0;
        } else {
          const { data: upserted } = await supabase.from(table).upsert(deduped, { onConflict: "codificacion" }).select();
          summary["Convenios IES Internacionales"] = upserted?.length || 0;
        }
      }

      // 4. Convenios en Trámite
      else if (sheetName.includes("Trámite") || sheetName.includes("Tramite")) {
        const table = "convenios_tramite";
        if (mode === "replace") {
          await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const rawParsed = rows.slice(8).map((r: any) => ({
          item: cleanInt(r[0]),
          fecha_recepcion: parseDateVal(r[1]),
          facultad_solicitante: cleanStr(r[2]),
          programa_academico: cleanStr(r[3]),
          persona_solicitante: cleanStr(r[4]),
          tipo_convenio: cleanStr(r[5]),
          institucion: cleanStr(r[6]),
          pais_ciudad: cleanStr(r[7]),
          contacto: cleanStr(r[8]),
          estado_tramite: cleanStr(r[9]),
          anio_gestion: cleanInt(r[10]),
          observaciones: cleanStr(r[11]),
          accion_pendiente: cleanStr(r[12]),
        })).filter((r: any) => r.item !== null || r.institucion);

        const { data: inserted } = await supabase.from(table).insert(rawParsed).select();
        summary["Convenios en Trámite"] = inserted?.length || 0;
      }

      // 5. REDES
      else if (sheetName.includes("REDES")) {
        const table = "convenios_redes";
        if (mode === "replace") {
          await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const rawParsed = rows.slice(2).map((r: any) => ({
          codificacion: cleanStr(r[0]),
          numero: cleanInt(r[1]),
          convenio_digital: cleanStr(r[2]),
          convenio_fisico: cleanStr(r[3]),
          red_nombre: cleanStr(r[4]),
          pais: cleanStr(r[5]),
          ciudad_pais: cleanStr(r[6]),
          nombre_convenio: cleanStr(r[7]),
          tipo_convenio: cleanStr(r[8]),
          contacto: cleanStr(r[9]),
          correo_electronico: cleanStr(r[10]),
          vigencia_desde: parseDateVal(r[17]) || parseDateVal(r[9]),
          vigencia_hasta: parseDateVal(r[18]) || parseDateVal(r[10]),
          estado_general: cleanStr(r[11]),
          duracion: cleanStr(r[12]),
          objetivo: cleanStr(r[13]) || cleanStr(r[15]),
          persona_registra: cleanStr(r[14]) || cleanStr(r[16]),
          vigencia_desde_actual: parseDateVal(r[17]),
          vigencia_hasta_actual: parseDateVal(r[18]),
        })).filter((r: any) => r.codificacion || r.red_nombre);

        const deduped = deduplicate(rawParsed, (r) => r.codificacion);

        if (mode === "replace") {
          const { data: inserted } = await supabase.from(table).insert(deduped).select();
          summary["REDES"] = inserted?.length || 0;
        } else {
          const { data: upserted } = await supabase.from(table).upsert(deduped, { onConflict: "codificacion" }).select();
          summary["REDES"] = upserted?.length || 0;
        }
      }

      // 6. Investigación
      else if (sheetName.includes("Investigación") || sheetName.includes("Investigacion")) {
        const table = "convenios_investigacion";
        if (mode === "replace") {
          await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const rawParsed = rows.slice(2).map((r: any) => ({
          codificacion: cleanStr(r[0]),
          numero: cleanInt(r[1]),
          convenio_digital: cleanStr(r[2]),
          convenio_fisico: cleanStr(r[3]),
          universidad_entidad: cleanStr(r[4]),
          pais: cleanStr(r[5]),
          ciudad_pais: cleanStr(r[6]),
          nombre_convenio: cleanStr(r[7]),
          tipo_convenio: cleanStr(r[8]),
          contacto: cleanStr(r[9]),
          correo_electronico: cleanStr(r[10]),
          vigencia_desde_original: parseDateVal(r[11]),
          vigencia_hasta_original: parseDateVal(r[12]),
          estado_general: cleanStr(r[13]),
          duracion: cleanStr(r[14]),
          objetivo: cleanStr(r[15]),
          persona_registra: cleanStr(r[16]),
          vigencia_desde_actual: parseDateVal(r[17]),
          vigencia_hasta_actual: parseDateVal(r[18]),
        })).filter((r: any) => r.codificacion || r.universidad_entidad);

        const deduped = deduplicate(rawParsed, (r) => r.codificacion);

        if (mode === "replace") {
          const { data: inserted } = await supabase.from(table).insert(deduped).select();
          summary["Investigación"] = inserted?.length || 0;
        } else {
          const { data: upserted } = await supabase.from(table).upsert(deduped, { onConflict: "codificacion" }).select();
          summary["Investigación"] = upserted?.length || 0;
        }
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
