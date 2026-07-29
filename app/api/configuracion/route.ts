import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("configuracion_app").select("*").limit(1).single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Default configuration if empty
    const config = data || {
      emails_notificacion: ["relacionconvenios@umariana.edu.co"],
      umbral_dias_1: 60,
      umbral_dias_2: 30,
      umbral_dias_3: 15,
      umbral_dias_4: 5,
      umbral_dias_5: 1,
    };

    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, emails_notificacion, bulkField, bulkValue } = body;
    const supabase = createAdminClient();

    // 1. Bulk toggle rule across all tables
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

    // 2. Save recipient emails list
    if (Array.isArray(emails_notificacion)) {
      const { data: existing } = await supabase.from("configuracion_app").select("id").limit(1).single();

      if (existing) {
        await supabase
          .from("configuracion_app")
          .update({ emails_notificacion, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("configuracion_app").insert({
          emails_notificacion,
          umbral_dias_1: 60,
          umbral_dias_2: 30,
          umbral_dias_3: 15,
          umbral_dias_4: 5,
          umbral_dias_5: 1,
        });
      }

      return NextResponse.json({ success: true, emails_notificacion });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
