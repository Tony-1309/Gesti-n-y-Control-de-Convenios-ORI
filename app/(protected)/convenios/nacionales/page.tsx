import { createClient } from "@/utils/supabase/server";
import TablaConvenios from "@/components/convenios/TablaConvenios";

export const revalidate = 0;

export default async function ConveniosNacionalesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("convenios_nacionales")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "universidad_entidad", label: "Universidad / Entidad" },
    { key: "ciudad", label: "Ciudad" },
    { key: "tipo_convenio_intercambio", label: "Tipo / Intercambio" },
    { key: "estado_general", label: "Estado", type: "select" as const, options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
    { key: "vigencia_desde_actual", label: "Vigencia Desde", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta", type: "date" as const },
    { key: "correo_electronico", label: "Correo Contacto" },
    { key: "persona_registra", label: "Persona Registra" },
  ];

  const createColumns = [
    { key: "codigo", label: "Código / Ref RNI" },
    { key: "universidad_entidad", label: "Universidad / Entidad Contraparte" },
    { key: "ciudad", label: "Ciudad" },
    { key: "convenio_digital", label: "Convenio Digital", type: "select" as const, options: ["SI", "NO"] },
    { key: "convenio_fisico", label: "Convenio Físico", type: "select" as const, options: ["SI", "NO"] },
    { key: "tipo_convenio_intercambio", label: "Tipo Convenio / Intercambio" },
    { key: "tipo_convenio", label: "Tipo Convenio", type: "select" as const, options: ["MARCO", "ESPECIFICO", "OTROS SI"] },
    { key: "contacto_ori", label: "Contacto ORI / Institucional" },
    { key: "correo_electronico", label: "Correo Electrónico de Contacto" },
    { key: "vigencia_desde_original", label: "Vigencia Desde (Original)", type: "date" as const },
    { key: "vigencia_hasta_original", label: "Vigencia Hasta (Original)", type: "date" as const },
    { key: "vigencia_desde_actual", label: "Vigencia Desde (Actual)", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta (Actual)", type: "date" as const },
    { key: "estado_general", label: "Estado General", type: "select" as const, options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
    { key: "duracion", label: "Duración / Término" },
    { key: "persona_registra", label: "Persona que Registra" },
    { key: "estado_preventivo", label: "Estado Preventivo" },
    { key: "objetivo", label: "Objetivo del Convenio" },
    { key: "observaciones", label: "Observaciones Adicionales / Enlace" },
  ];

  return (
    <TablaConvenios
      tabla="convenios_nacionales"
      title="Convenios IES Nacionales"
      subtitle="Convenios celebrados con instituciones de educación superior en Colombia"
      columns={columns}
      createColumns={createColumns}
      initialData={data || []}
    />
  );
}
