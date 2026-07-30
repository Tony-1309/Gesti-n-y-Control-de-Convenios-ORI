import { createClient } from "@/utils/supabase/server";
import TablaConvenios from "@/components/convenios/TablaConvenios";

export const revalidate = 0;

export default async function ConveniosInvestigacionPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("convenios_investigacion")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "codificacion", label: "Codificación" },
    { key: "universidad_entidad", label: "Universidad / Entidad" },
    { key: "nombre_convenio", label: "Nombre del Convenio" },
    { key: "pais", label: "País" },
    { key: "tipo_convenio", label: "Tipo" },
    { key: "estado_general", label: "Estado", type: "select" as const, options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
    { key: "vigencia_desde_actual", label: "Vigencia Desde", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta", type: "date" as const },
    { key: "correo_electronico", label: "Correo Contacto" },
  ];

  const createColumns = [
    { key: "codificacion", label: "Codificación / RNI" },
    { key: "universidad_entidad", label: "Universidad / Entidad Contraparte" },
    { key: "nombre_convenio", label: "Nombre del Convenio / Proyecto Investigación" },
    { key: "pais", label: "País" },
    { key: "ciudad_pais", label: "Ciudad / País" },
    { key: "convenio_digital", label: "Convenio Digital", type: "select" as const, options: ["SI", "NO"] },
    { key: "convenio_fisico", label: "Convenio Físico", type: "select" as const, options: ["SI", "NO"] },
    { key: "tipo_convenio", label: "Tipo Convenio" },
    { key: "contacto", label: "Contacto / Investigador" },
    { key: "correo_electronico", label: "Correo Electrónico de Contacto" },
    { key: "vigencia_desde_original", label: "Vigencia Desde (Original)", type: "date" as const },
    { key: "vigencia_hasta_original", label: "Vigencia Hasta (Original)", type: "date" as const },
    { key: "vigencia_desde_actual", label: "Vigencia Desde (Actual)", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta (Actual)", type: "date" as const },
    { key: "estado_general", label: "Estado General", type: "select" as const, options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
    { key: "duracion", label: "Duración / Término" },
    { key: "persona_registra", label: "Persona que Registra" },
    { key: "objetivo", label: "Objetivo del Convenio" },
    { key: "observaciones", label: "Observaciones Adicionales / Enlace" },
  ];

  return (
    <TablaConvenios
      tabla="convenios_investigacion"
      title="Convenios de Investigación"
      subtitle="Acuerdos interinstitucionales específicos enfocados en investigación científica y transferencia de conocimiento"
      columns={columns}
      createColumns={createColumns}
      initialData={data || []}
    />
  );
}
