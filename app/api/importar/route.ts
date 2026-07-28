import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

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
    const results: Record<string, { inserted: number; updated: number }> = {};

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (sheetName.includes("Convenios Int. vigentes")) {
        const table = "convenios_internacionales_vigentes";
        if (mode === "replace") await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const parsed = rows.slice(10).map((r: any) => ({
          codificacion: r[0] ? String(r[0]).trim() : null,
          convenio_digital: r[1] ? String(r[1]) : null,
          convenio_fisico: r[2] ? String(r[2]) : null,
          universidad: r[3] ? String(r[3]) : null,
          pais: r[4] ? String(r[4]) : null,
          ciudad_pais: r[5] ? String(r[5]) : null,
          tipo_convenio_intercambio: r[6] ? String(r[6]) : null,
          tipo_convenio: r[7] ? String(r[7]) : null,
          contacto_ori: r[8] ? String(r[8]) : null,
          correo_electronico: r[9] ? String(r[9]) : null,
          estado_general: r[12] ? String(r[12]) : null,
          persona_registra: r[15] ? String(r[15]) : null,
        })).filter((r: any) => r.codificacion || r.universidad);

        const { data: res } = await supabase.from(table).upsert(parsed, { onConflict: "codificacion" }).select();
        results[sheetName] = { inserted: res?.length || 0, updated: 0 };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
