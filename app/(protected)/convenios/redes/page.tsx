import { createClient } from "@/utils/supabase/server";
import TablaConvenios from "@/components/convenios/TablaConvenios";

export const revalidate = 0;

export default async function ConveniosRedesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("convenios_redes")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "codificacion", label: "Codificación" },
    { key: "red_nombre", label: "Nombre de la Red" },
    { key: "pais", label: "País" },
    { key: "ciudad_pais", label: "Ciudad / País" },
    { key: "tipo_convenio", label: "Tipo" },
    { key: "contacto", label: "Contacto" },
    { key: "correo_electronico", label: "Correo Contacto" },
    { key: "estado_general", label: "Estado" },
    { key: "vigencia_desde_actual", label: "Vigencia Desde", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta", type: "date" as const },
  ];

  return (
    <TablaConvenios
      tabla="convenios_redes"
      title="Convenios de REDES"
      subtitle="Adhesiones a redes de educación superior nacionales e internacionales (ej: REDEC, RUCC, ASCOFADE)"
      columns={columns}
      initialData={data || []}
    />
  );
}
