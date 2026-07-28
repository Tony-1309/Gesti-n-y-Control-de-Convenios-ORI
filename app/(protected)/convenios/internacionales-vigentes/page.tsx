import { createClient } from "@/utils/supabase/server";
import TablaConvenios from "@/components/convenios/TablaConvenios";

export const revalidate = 0;

export default async function ConveniosIntVigentesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("convenios_internacionales_vigentes")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "codificacion", label: "Codificación" },
    { key: "universidad", label: "Universidad / Institución" },
    { key: "pais", label: "País" },
    { key: "tipo_convenio", label: "Tipo", type: "select" as const, options: ["MARCO", "ESPECIFICO", "OTROS SI"] },
    { key: "estado_general", label: "Estado", type: "select" as const, options: ["VIGENTE", "TERMINADO", "VENCIDO"] },
    { key: "vigencia_desde_actual", label: "Vigencia Desde", type: "date" as const },
    { key: "vigencia_hasta_actual", label: "Vigencia Hasta", type: "date" as const },
    { key: "correo_electronico", label: "Correo Contacto" },
    { key: "persona_registra", label: "Persona Registra" },
  ];

  return (
    <TablaConvenios
      tabla="convenios_internacionales_vigentes"
      title="Convenios Internacionales Vigentes"
      subtitle="Filtro actual de la Oficina de Relaciones Internacionales"
      columns={columns}
      initialData={data || []}
    />
  );
}
