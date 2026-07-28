import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch data from all tables
    const [
      { data: intVigentes },
      { data: nacionales },
      { data: internacionales },
      { data: tramite },
      { data: redes },
      { data: investigacion },
    ] = await Promise.all([
      supabase.from("convenios_internacionales_vigentes").select("*"),
      supabase.from("convenios_nacionales").select("*"),
      supabase.from("convenios_internacionales").select("*"),
      supabase.from("convenios_tramite").select("*"),
      supabase.from("convenios_redes").select("*"),
      supabase.from("convenios_investigacion").select("*"),
    ]);

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Convenios Int. vigentes
    if (intVigentes) {
      const ws1 = XLSX.utils.json_to_sheet(
        intVigentes.map((r: any) => ({
          "CODIFICACION": r.codificacion,
          "Convenio encontrado en digital": r.convenio_digital,
          "Convenio encontrado en fisico Archivo.": r.convenio_fisico,
          "UNIVERSIDAD": r.universidad,
          "PAIS": r.pais,
          "CUIUDAD/PAIS": r.ciudad_pais,
          "TIPO DE CONVENIO E INTERCAMBIO": r.tipo_convenio_intercambio,
          "TIPO DE CONVENIO": r.tipo_convenio,
          "CONTACTO OFICINA DE RELACIONES INTERNACIONALES": r.contacto_ori,
          "CORREO ELECTRONICO": r.correo_electronico,
          "VIGENCIA DESDE": r.vigencia_desde_original,
          "VIGENCIA HASTA": r.vigencia_hasta_original,
          "ESTADO GENERAL ACTUAL DEL CONVENIO O ACUERDO": r.estado_general,
          "DURACIÓN": r.duracion,
          "OBJETIVO": r.objetivo,
          "PERSONA QUE REGISTRA LA CARPETA": r.persona_registra,
          "VIGENCIA DESDE (actual)": r.vigencia_desde_actual,
          "VIGENCIA HASTA (actual)": r.vigencia_hasta_actual,
          "Estado Preventivo": r.estado_preventivo,
          "Observaciones": r.observaciones,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, ws1, "Convenios Int. vigentes");
    }

    // Sheet 2: Convenios IES Nacionales
    if (nacionales) {
      const ws2 = XLSX.utils.json_to_sheet(
        nacionales.map((r: any) => ({
          "CÓDIGO": r.codigo,
          "N.": r.numero,
          "Convenio encontrado en digital": r.convenio_digital,
          "Convenio encontrado en físico-Archivo": r.convenio_fisico,
          "UNIVERSIDAD O ENTIDAD": r.universidad_entidad,
          "CIUDAD": r.ciudad,
          "TIPO DE CONVENIO E INTERCAMBIO": r.tipo_convenio_intercambio,
          "CONTACTO DE LA OFICINA DE RELACIONES INTERNACIONALES": r.contacto_ori,
          "CORREO ELECTRONICO": r.correo_electronico,
          "VIGENCIA DESDE": r.vigencia_desde_original,
          "VIGENCIA HASTA": r.vigencia_hasta_original,
          "ESTADO GENERAL ACTUAL DEL CONVENIO O ACUERDO": r.estado_general,
          "DURACIÓN": r.duracion,
          "OBJETIVO": r.objetivo,
          "PERSONA QUE REGISTRA LA CARPETA": r.persona_registra,
          "VIGENCIA DESDE (actual)": r.vigencia_desde_actual,
          "VIGENCIA HASTA (actual)": r.vigencia_hasta_actual,
          "Estado Preventivo": r.estado_preventivo,
          "Observaciones": r.observaciones,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, ws2, "Convenios IES Nacionales");
    }

    // Sheet 3: Convenios IES Internacionales
    if (internacionales) {
      const ws3 = XLSX.utils.json_to_sheet(
        internacionales.map((r: any) => ({
          "CODIFICACION": r.codificacion,
          "UNIVERSIDAD": r.universidad,
          "PAIS": r.pais,
          "TIPO DE CONVENIO": r.tipo_convenio,
          "ESTADO GENERAL": r.estado_general,
          "VIGENCIA HASTA (actual)": r.vigencia_hasta_actual,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, ws3, "Convenios IES Internacionales");
    }

    // Sheet 4: Convenios en Trámite
    if (tramite) {
      const ws4 = XLSX.utils.json_to_sheet(
        tramite.map((r: any) => ({
          "ITEM": r.item,
          "FECHA DE RECEPCIÓ N": r.fecha_recepcion,
          "FACULTAD SOLICITANTE": r.facultad_solicitante,
          "PROGRAMA ACADÉMICO": r.programa_academico,
          "PERSONA SOLICITANTE": r.persona_solicitante,
          "TIPO DE CONVENIO": r.tipo_convenio,
          "INSTITUCIÓN": r.institucion,
          "PAIS/CIUDAD": r.pais_ciudad,
          "CONTACTO": r.contacto,
          "ESTADO DEL TRÁMITE": r.estado_tramite,
          "AÑO GESTIÓN": r.anio_gestion,
          "OBSERVACIONES": r.observaciones,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, ws4, "Convenios en Trámite");
    }

    // Sheet 5: REDES
    if (redes) {
      const ws5 = XLSX.utils.json_to_sheet(redes);
      XLSX.utils.book_append_sheet(workbook, ws5, "REDES");
    }

    // Sheet 6: Investigación
    if (investigacion) {
      const ws6 = XLSX.utils.json_to_sheet(investigacion);
      XLSX.utils.book_append_sheet(workbook, ws6, "Investigación");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Matriz_Gestion_Convenios_ORI_2026_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
