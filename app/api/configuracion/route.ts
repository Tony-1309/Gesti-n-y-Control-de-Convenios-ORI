import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

const DEFAULT_CONFIG = {
  emails_notificacion: ["relacionconvenios@umariana.edu.co"],
  umbral_dias_1: 60,
  umbral_dias_2: 30,
  umbral_dias_3: 15,
  umbral_dias_4: 5,
  umbral_dias_5: 1,
  canal_email_activo: true,
  canal_dashboard_activo: true,
  hora_envio_colombia: "08:00",
  frecuencia_envio: "diario",
  formato_envio: "consolidado",
  categorias_activas: [
    "convenios_internacionales_vigentes",
    "convenios_nacionales",
    "convenios_internacionales",
    "convenios_tramite",
    "convenios_redes",
    "convenios_investigacion",
  ],
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("configuracion_app").select("*").limit(1).single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const config = data
      ? {
          ...DEFAULT_CONFIG,
          ...data,
          emails_notificacion: data.emails_notificacion || DEFAULT_CONFIG.emails_notificacion,
          categorias_activas: data.categorias_activas || DEFAULT_CONFIG.categorias_activas,
        }
      : DEFAULT_CONFIG;

    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, config: newConfig, emails_notificacion, bulkField, bulkValue } = body;
    const supabase = createAdminClient();

    // 1. Bulk toggle threshold rule across all tables
    if (action === "bulk_toggle" && bulkField && typeof bulkValue === "boolean") {
      const tables = [
        "convenios_internacionales_vigentes",
        "convenios_nacionales",
        "convenios_internacionales",
        "convenios_redes",
        "convenios_investigacion",
      ];

      for (const table of tables) {
        await supabase
          .from(table)
          .update({ [bulkField]: bulkValue })
          .neq("id", "00000000-0000-0000-0000-000000000000");
      }

      return NextResponse.json({
        success: true,
        message: `Regla ${bulkField} actualizada a ${bulkValue ? "Activa" : "Desactivada"} en todos los convenios.`,
      });
    }

    // 2. Save full settings (Channels, Times, Categories, Format, Emails)
    const payload = newConfig || (Array.isArray(emails_notificacion) ? { emails_notificacion } : null);

    if (payload) {
      const { data: existing } = await supabase.from("configuracion_app").select("id").limit(1).single();

      const saveData = {
        ...payload,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase
          .from("configuracion_app")
          .update(saveData)
          .eq("id", existing.id);
      } else {
        await supabase.from("configuracion_app").insert({
          ...DEFAULT_CONFIG,
          ...saveData,
        });
      }

      return NextResponse.json({ success: true, config: saveData });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
