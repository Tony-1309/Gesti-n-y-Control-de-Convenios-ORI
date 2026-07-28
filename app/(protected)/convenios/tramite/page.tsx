import { createClient } from "@/utils/supabase/server";
import TablaConvenios from "@/components/convenios/TablaConvenios";

export const revalidate = 0;

export default async function ConveniosTramitePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("convenios_tramite")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "item", label: "Item", type: "number" as const },
    { key: "fecha_recepcion", label: "Fecha Recepción", type: "date" as const },
    { key: "facultad_solicitante", label: "Facultad Solicitante" },
    { key: "programa_academico", label: "Programa Académico" },
    { key: "persona_solicitante", label: "Persona Solicitante" },
    { key: "tipo_convenio", label: "Tipo Convenio" },
    { key: "institucion", label: "Institución" },
    { key: "pais_ciudad", label: "País / Ciudad" },
    { key: "contacto", label: "Contacto" },
    { key: "estado_tramite", label: "Estado del Trámite" },
    { key: "observaciones", label: "Observaciones" },
    { key: "accion_pendiente", label: "Acción Pendiente" },
  ];

  return (
    <TablaConvenios
      tabla="convenios_tramite"
      title="Convenios en Trámite"
      subtitle="Solicitudes de convenios en revisión jurídica, rectoría o instituciones contrapartes"
      columns={columns}
      initialData={data || []}
    />
  );
}
