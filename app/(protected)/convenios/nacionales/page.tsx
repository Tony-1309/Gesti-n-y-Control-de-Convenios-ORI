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

  return (
    <TablaConvenios
      tabla="convenios_nacionales"
      title="Convenios IES Nacionales"
      subtitle="Convenios celebrados con instituciones de educación superior en Colombia"
      columns={columns}
      initialData={data || []}
    />
  );
}
