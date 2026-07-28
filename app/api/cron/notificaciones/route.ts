import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { test, customEmail } = body;

    const recipient = customEmail || process.env.NOTIFICATION_EMAIL_TO || "salcedoantony1309@gmail.com";

    // If manual test email
    if (test) {
      const emailResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: recipient,
        subject: "🔔 Prueba de Alerta ORI - Convenio Próximo a Vencer",
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 10px;">
            <h2 style="color: #d97706;">Universidad Mariana - Oficina de Relaciones Internacionales</h2>
            <p style="font-size: 14px; color: #cbd5e1;">Este es un correo de prueba del sistema automatizado de gestión y control de convenios.</p>
            <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 15px 0;">
              <strong>Estado del sistema:</strong> Conexión con Resend API verificada correctamente.<br/>
              <strong>Destinatario configurado:</strong> ${recipient}
            </div>
            <p style="font-size: 12px; color: #94a3b8;">Sistema de Alerta a 15, 10, 5 y 1 días del vencimiento.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, emailResult });
    }

    // Daily Cron Job Logic: Check expiring agreements from view
    const supabase = createAdminClient();
    const { data: proximos, error } = await supabase.from("convenios_proximos_vencer").select("*");

    if (error || !proximos || proximos.length === 0) {
      return NextResponse.json({ message: "No hay convenios pendientes de notificar hoy." });
    }

    // Send emails for each expiring agreement
    for (const item of proximos) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: recipient,
        subject: `⚠️ ALERTA CONVENIO (${item.dias_restantes} Días): ${item.institucion || item.codigo}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 10px;">
            <h2 style="color: #ef4444;">Oficina de Relaciones Internacionales - Universidad Mariana</h2>
            <p style="font-size: 14px;">Atención: El convenio interinstitucional se encuentra próximo a su vencimiento.</p>
            <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155;">
              <p><strong>Institución:</strong> ${item.institucion}</p>
              <p><strong>Código:</strong> ${item.codigo || 'N/A'}</p>
              <p><strong>País:</strong> ${item.pais || 'N/A'}</p>
              <p><strong>Fecha de Vencimiento:</strong> ${item.fecha_vencimiento}</p>
              <p><strong>Días Restantes:</strong> <span style="color: #f59e0b; font-weight: bold;">${item.dias_restantes} días</span></p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">Por favor verifique la movilidad o inicie el proceso de renovación.</p>
          </div>
        `,
      });

      // Log sent notification
      await supabase.from("notificaciones_log").insert({
        convenio_id: item.id,
        tabla_origen: item.tabla_origen,
        tipo_notificacion: `${item.dias_restantes}_dias`,
        destinatario_email: recipient,
      });
    }

    return NextResponse.json({ success: true, count: proximos.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Alias for GET cron invocation
  return POST(request);
}
