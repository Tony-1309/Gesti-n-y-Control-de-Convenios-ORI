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
    { key: "pais", label: "País" },
    { key: "ciudad_pais", label: "Ciudad / País" },
    { key: "nombre_convenio", label: "Nombre del Convenio" },
    { key: "tipo_convenio", label: "Tipo" },
    { key: "contacto", label: "Contacto" },
    { key: "correo_electronico", label: "Correo Contacto" },
    { key: "estado_general", label: "Estado" },
    { key: "vigencia_desde_actual", label: "Vigencia Desde", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta", type: "date" as const },
  ];

  return (
    <TablaConvenios
      tabla="convenios_investigacion"
      title="Convenios de Investigación"
      subtitle="Acuerdos interinstitucionales específicos enfocados en investigación científica y transferencia de conocimiento"
      columns={columns}
      initialData={data || []}
    />
  );
}
