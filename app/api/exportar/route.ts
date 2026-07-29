import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import ExcelJS from "exceljs";
import path from "path";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch current data from Supabase for all 6 tables
    const [
      { data: intVigentes },
      { data: nacionales },
      { data: internacionales },
      { data: tramite },
      { data: redes },
      { data: investigacion },
    ] = await Promise.all([
      supabase.from("convenios_internacionales_vigentes").select("*").order("created_at", { ascending: true }),
      supabase.from("convenios_nacionales").select("*").order("created_at", { ascending: true }),
      supabase.from("convenios_internacionales").select("*").order("created_at", { ascending: true }),
      supabase.from("convenios_tramite").select("*").order("created_at", { ascending: true }),
      supabase.from("convenios_redes").select("*").order("created_at", { ascending: true }),
      supabase.from("convenios_investigacion").select("*").order("created_at", { ascending: true }),
    ]);

    // 2. Load original template file preserving ALL formatting, headers, styles & formulas
    const templatePath = path.join(process.cwd(), "templates", "matriz_template.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const parseVal = (v: any) => (v === null || v === undefined ? "" : v);

    // Function to apply cell values while copying styles from template row
    const writeSheetRows = (
      sheetName: string,
      startRow: number,
      data: any[],
      mapper: (item: any) => any[]
    ) => {
      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet || !data) return;

      // Sample template style row (first data row)
      const templateRow = sheet.getRow(startRow);

      data.forEach((item, index) => {
        const currentRowIndex = startRow + index;
        const rowValues = mapper(item);
        const row = sheet.getRow(currentRowIndex);

        rowValues.forEach((val, colIdx) => {
          const colNum = colIdx + 1;
          const cell = row.getCell(colNum);
          const sampleCell = templateRow.getCell(colNum);

          // Preserve styles from original template cell
          if (sampleCell.style) {
            cell.style = JSON.parse(JSON.stringify(sampleCell.style));
          }

          cell.value = parseVal(val);
        });

        row.commit();
      });

      // Clear any extra remaining rows from template if dataset is smaller
      const totalRows = sheet.rowCount;
      const lastWrittenRow = startRow + data.length - 1;
      for (let r = lastWrittenRow + 1; r <= totalRows; r++) {
        const rowToClear = sheet.getRow(r);
        rowToClear.eachCell((cell) => {
          cell.value = null;
        });
      }
    };

    // Sheet 1: Convenios Int. vigentes (Starts row 11)
    if (intVigentes) {
      writeSheetRows("Convenios Int. vigentes", 11, intVigentes, (r) => [
        r.codificacion,
        r.convenio_digital,
        r.convenio_fisico,
        r.universidad,
        r.pais,
        r.ciudad_pais,
        r.tipo_convenio_intercambio,
        r.tipo_convenio,
        r.contacto_ori,
        r.correo_electronico,
        r.vigencia_desde_original,
        r.vigencia_hasta_original,
        r.estado_general,
        r.duracion,
        r.objetivo,
        r.persona_registra,
        r.vigencia_desde_actual,
        r.vigencia_hasta_actual,
        r.estado_preventivo,
        r.observaciones,
        r.link_documento,
      ]);
    }

    // Sheet 2: Convenios IES Nacionales (Starts row 10)
    const nacSheetName = workbook.worksheets.find((w) => w.name.includes("Nacionales"))?.name || "Convenios IES Nacionales ";
    if (nacionales) {
      writeSheetRows(nacSheetName, 10, nacionales, (r) => [
        r.codigo,
        r.numero,
        r.convenio_digital,
        r.convenio_fisico,
        r.universidad_entidad,
        r.ciudad,
        r.tipo_convenio_intercambio,
        r.contacto_ori,
        r.correo_electronico,
        r.vigencia_desde_original,
        r.vigencia_hasta_original,
        r.estado_general,
        r.duracion,
        r.objetivo,
        r.persona_registra,
        r.vigencia_desde_actual,
        r.vigencia_hasta_actual,
        "",
        r.estado_preventivo,
        r.observaciones,
        r.link_documento,
      ]);
    }

    // Sheet 3: Convenios IES Internacionales (Starts row 11)
    if (internacionales) {
      writeSheetRows("Convenios IES Internacionales", 11, internacionales, (r) => [
        r.codificacion,
        r.convenio_digital,
        r.convenio_fisico,
        r.universidad,
        r.pais,
        r.ciudad_pais,
        r.tipo_convenio_intercambio,
        r.tipo_convenio,
        r.contacto_ori,
        r.correo_electronico,
        r.vigencia_desde_original,
        r.vigencia_hasta_original,
        r.estado_general,
        r.duracion,
        r.objetivo,
        r.persona_registra,
        r.vigencia_desde_actual,
        r.vigencia_hasta_actual,
        "",
        r.estado_preventivo,
        r.observaciones,
        r.link_documento,
      ]);
    }

    // Sheet 4: Convenios en Trámite (Starts row 9)
    const tramiteSheetName = workbook.worksheets.find((w) => w.name.includes("Trámite") || w.name.includes("Tramite"))?.name || "Convenios en Trámite";
    if (tramite) {
      writeSheetRows(tramiteSheetName, 9, tramite, (r) => [
        r.item,
        r.fecha_recepcion,
        r.facultad_solicitante,
        r.programa_academico,
        r.persona_solicitante,
        r.tipo_convenio,
        r.institucion,
        r.pais_ciudad,
        r.contacto,
        r.estado_tramite,
        r.anio_gestion,
        r.observaciones,
        r.accion_pendiente,
      ]);
    }

    // Sheet 5: REDES (Starts row 3)
    if (redes) {
      writeSheetRows("REDES", 3, redes, (r) => [
        r.codificacion,
        r.numero,
        r.convenio_digital,
        r.convenio_fisico,
        r.red_nombre,
        r.pais,
        r.ciudad_pais,
        r.nombre_convenio,
        r.tipo_convenio,
        r.contacto,
        r.correo_electronico,
        r.vigencia_desde,
        r.vigencia_hasta,
        r.estado_general,
        r.duracion,
        r.objetivo,
        r.persona_registra,
        r.vigencia_desde_actual,
        r.vigencia_hasta_actual,
      ]);
    }

    // Sheet 6: Investigación (Starts row 3)
    const invSheetName = workbook.worksheets.find((w) => w.name.includes("Investigación") || w.name.includes("Investigacion"))?.name || "Investigación";
    if (investigacion) {
      writeSheetRows(invSheetName, 3, investigacion, (r) => [
        r.codificacion,
        r.numero,
        r.convenio_digital,
        r.convenio_fisico,
        r.universidad_entidad,
        r.pais,
        r.ciudad_pais,
        r.nombre_convenio,
        r.tipo_convenio,
        r.contacto,
        r.correo_electronico,
        r.vigencia_desde_original,
        r.vigencia_hasta_original,
        r.estado_general,
        r.duracion,
        r.objetivo,
        r.persona_registra,
        r.vigencia_desde_actual,
        r.vigencia_hasta_actual,
      ]);
    }

    // Generate output Excel buffer with full original styling
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Matriz_Gestion_y_Control_Convenios_ORI_2026.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
