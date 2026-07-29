import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/server";
import { getConveniosProximosVencer } from "@/lib/queries";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildFormalEmailHTML(item: {
  institucion?: string | null;
  codigo?: string | null;
  pais?: string | null;
  fecha_vencimiento?: string;
  dias_restantes?: number;
}) {
  const dias = item.dias_restantes ?? 0;
  let urgencyTitle = "ALERTA PREVENTIVA (2 Meses)";
  let headerColor = "#2563eb"; // Blue
  let badgeColor = "#3b82f6";

  if (dias <= 1) {
    urgencyTitle = "🚨 ALERTA CRÍTICA (ÚLTIMO DÍA)";
    headerColor = "#dc2626"; // Red
    badgeColor = "#ef4444";
  } else if (dias <= 5) {
    urgencyTitle = "⚠️ ALERTA URGENTE (5 Días)";
    headerColor = "#ea580c"; // Orange
    badgeColor = "#f97316";
  } else if (dias <= 15) {
    urgencyTitle = "🔔 ALERTA DE VENCIMIENTO (15 Días)";
    headerColor = "#d97706"; // Amber
    badgeColor = "#f59e0b";
  } else if (dias <= 30) {
    urgencyTitle = "📋 ALERTA PREVENTIVA (1 Mes)";
    headerColor = "#0284c7"; // Sky Blue
    badgeColor = "#38bdf8";
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Notificación Convenio ORI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Arial, Helvetica, sans-serif; color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Encabezado Institucional -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a2e5a 0%, #0f172a 100%); padding: 25px 30px; border-bottom: 3px solid #c9a84c;">
                  <table width="100%">
                    <tr>
                      <td>
                        <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">UNIVERSIDAD MARIANA</h1>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #c9a84c; font-weight: bold; text-transform: uppercase;">Oficina de Relaciones Internacionales (ORI)</p>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; padding: 6px 14px; background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: bold; border-radius: 20px;">
                          ${urgencyTitle}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Saludo Cordial -->
              <tr>
                <td style="padding: 25px 30px 15px 30px;">
                  <p style="margin: 0; font-size: 14px; color: #e2e8f0; line-height: 1.6;">
                    Cordial saludo,<br><br>
                    Nos dirigimos a usted para informarle de manera preventiva sobre la próxima culminación de la vigencia del convenio interinstitucional detallado a continuación:
                  </p>
                </td>
              </tr>

              <!-- Tarjeta de Detalles del Convenio -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 10px; border: 1px solid #334155; padding: 20px;">
                    <tr>
                      <td style="padding-bottom: 12px; border-bottom: 1px solid #1e293b;">
                        <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Institución / Universidad</span>
                        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: bold; color: #ffffff;">${item.institucion || 'Convenio Sin Nombre'}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e293b;">
                        <table width="100%">
                          <tr>
                            <td width="50%">
                              <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Código RNI</span>
                              <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold; color: #cbd5e1;">${item.codigo || 'Sin código'}</p>
                            </td>
                            <td width="50%">
                              <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">País / Ciudad</span>
                              <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">${item.pais || 'N/A'}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 12px;">
                        <table width="100%">
                          <tr>
                            <td width="50%">
                              <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Fecha de Vencimiento</span>
                              <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #f8fafc;">${item.fecha_vencimiento || 'N/A'}</p>
                            </td>
                            <td width="50%">
                              <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Tiempo Restante</span>
                              <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold; color: ${headerColor};">
                                ${dias} días calendario
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Recomendación de Acción -->
              <tr>
                <td style="padding: 0 30px 25px 30px;">
                  <div style="background-color: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #93c5fd; line-height: 1.5;">
                      <strong>Acción sugerida:</strong> Favor revisar el estado de las actividades de movilidad o la extensión de prórroga con la contraparte para determinar si corresponde renovar o finalizar el acuerdo.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Despedida y Firma -->
              <tr>
                <td style="padding: 20px 30px; background-color: #0b1324; border-top: 1px solid #334155;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    Atentamente,<br>
                    <strong style="color: #ffffff;">Oficina de Relaciones Internacionales (ORI)</strong><br>
                    Universidad Mariana — Pasto, Nariño, Colombia<br>
                    <span style="font-size: 11px; color: #64748b;">Sistema de Gestión y Control de Convenios 2026</span>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { test, customEmail } = body;

    const supabase = createAdminClient();

    // Fetch registered recipient emails from configuracion_app or env
    const { data: configData } = await supabase.from("configuracion_app").select("emails_notificacion").limit(1).single();
    let recipients: string[] = configData?.emails_notificacion || [];

    if (customEmail) {
      recipients = [customEmail];
    } else if (recipients.length === 0) {
      recipients = [process.env.NOTIFICATION_EMAIL_TO || "antonyst.salcedo@umariana.edu.co"];
    }

    const senderEmail = process.env.NOTIFICATION_EMAIL_FROM || "onboarding@resend.dev";

    // Single test email
    if (test) {
      const testItem = {
        institucion: "Universidad de Prueba (Demostración ORI)",
        codigo: "RNI-DEMO-2026",
        pais: "Colombia",
        fecha_vencimiento: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        dias_restantes: 15,
      };

      const emailHTML = buildFormalEmailHTML(testItem);

      // Resend API send to all registered recipients
      const { data: emailResult, error: sendError } = await resend.emails.send({
        from: senderEmail,
        to: recipients,
        subject: "🔔 [NOTIFICACIÓN ORI] Prueba de Alerta de Convenio - Universidad Mariana",
        html: emailHTML,
      });

      if (sendError) {
        return NextResponse.json({ error: sendError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, emailResult, recipients });
    }

    // Dynamic calculation of expiring agreements up to 65 days
    const proximos = await getConveniosProximosVencer(65);

    if (!proximos || proximos.length === 0) {
      return NextResponse.json({ message: "No hay convenios pendientes de notificar hoy." });
    }

    let sentCount = 0;

    for (const item of proximos) {
      const dias = item.dias_restantes;

      // Filter by threshold toggles
      let shouldSend = false;
      if (dias <= 1 && item.notificacion_1dia !== false) shouldSend = true;
      else if (dias > 1 && dias <= 5 && item.notificacion_5dias !== false) shouldSend = true;
      else if (dias > 5 && dias <= 15 && item.notificacion_15dias !== false) shouldSend = true;
      else if (dias > 15 && dias <= 30 && item.notificacion_30dias !== false) shouldSend = true;
      else if (dias > 30 && dias <= 65 && item.notificacion_60dias !== false) shouldSend = true;

      if (!shouldSend) continue;

      const emailHTML = buildFormalEmailHTML(item);

      const { data: resData, error: sendErr } = await resend.emails.send({
        from: senderEmail,
        to: recipients,
        subject: `⚠️ [NOTIFICACIÓN ORI] Convenio Próximo a Vencer (${dias} Días): ${item.institucion || item.codigo}`,
        html: emailHTML,
      });

      if (!sendErr && resData) {
        // Log sent alert
        await supabase.from("notificaciones_log").insert({
          convenio_id: item.id,
          tabla_origen: item.tabla_origen,
          tipo_notificacion: `${dias}_dias`,
          destinatario_email: recipients.join(", "),
        });

        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sentCount, totalExpiring: proximos.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
