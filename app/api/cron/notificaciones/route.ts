import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/server";
import { getConveniosProximosVencer, ProximoVencerItem } from "@/lib/queries";

const resend = new Resend(process.env.RESEND_API_KEY);

function getCategoryName(tabla: string) {
  switch (tabla) {
    case "convenios_internacionales_vigentes":
      return "Int. Vigentes";
    case "convenios_nacionales":
      return "IES Nacionales";
    case "convenios_internacionales":
      return "IES Internacionales";
    case "convenios_redes":
      return "REDES";
    case "convenios_investigacion":
      return "Investigación";
    default:
      return "Convenios";
  }
}

// Single Item Email HTML
function buildSingleEmailHTML(item: {
  institucion?: string | null;
  codigo?: string | null;
  pais?: string | null;
  fecha_vencimiento?: string;
  dias_restantes?: number;
}) {
  const dias = item.dias_restantes ?? 0;
  let urgencyTitle = "ALERTA PREVENTIVA (2 Meses)";
  let headerColor = "#2563eb";
  let badgeColor = "#3b82f6";

  if (dias <= 1) {
    urgencyTitle = "🚨 ALERTA CRÍTICA (ÚLTIMO DÍA)";
    headerColor = "#dc2626";
    badgeColor = "#ef4444";
  } else if (dias <= 5) {
    urgencyTitle = "⚠️ ALERTA URGENTE (5 Días)";
    headerColor = "#ea580c";
    badgeColor = "#f97316";
  } else if (dias <= 15) {
    urgencyTitle = "🔔 ALERTA DE VENCIMIENTO (15 Días)";
    headerColor = "#d97706";
    badgeColor = "#f59e0b";
  } else if (dias <= 30) {
    urgencyTitle = "📋 ALERTA PREVENTIVA (1 Mes)";
    headerColor = "#0284c7";
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

// Consolidated Summary Email HTML
function buildConsolidatedEmailHTML(items: ProximoVencerItem[]) {
  const tableRows = items.map((item) => {
    const dias = item.dias_restantes;
    let badgeColor = "#3b82f6";
    if (dias <= 1) badgeColor = "#ef4444";
    else if (dias <= 5) badgeColor = "#f97316";
    else if (dias <= 15) badgeColor = "#f59e0b";

    return `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 12px; font-size: 13px; color: #ffffff; font-weight: bold;">${item.institucion || 'Sin Nombre'}</td>
        <td style="padding: 12px; font-size: 12px; color: #cbd5e1;">${item.codigo || 'N/A'}</td>
        <td style="padding: 12px; font-size: 12px; color: #94a3b8;">${getCategoryName(item.tabla_origen)}</td>
        <td style="padding: 12px; font-size: 12px; color: #e2e8f0;">${item.fecha_vencimiento}</td>
        <td style="padding: 12px;" align="center">
          <span style="display: inline-block; padding: 4px 10px; background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: bold; border-radius: 12px;">
            ${dias} días
          </span>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Resumen de Convenios por Vencer ORI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Arial, Helvetica, sans-serif; color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
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
                        <span style="display: inline-block; padding: 6px 14px; background-color: #c9a84c; color: #0f172a; font-size: 11px; font-weight: bold; border-radius: 20px;">
                          📋 RESUMEN DIARIO CONSOLIDADO
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
                    Le presentamos el resumen consolidado de los <strong>${items.length} convenios interinstitucionales</strong> próximos a vencer dentro del rango de alerta configurado (2 meses, 1 mes, 15 días, 5 días y 1 día):
                  </p>
                </td>
              </tr>

              <!-- Tabla Consolidada -->
              <tr>
                <td style="padding: 0 30px 25px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 10px; border: 1px solid #334155; border-collapse: collapse; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #0b1324; border-bottom: 1px solid #334155;">
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Institución</th>
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Código</th>
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Categoría</th>
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Vencimiento</th>
                        <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Restante</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tableRows}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Recomendación de Acción -->
              <tr>
                <td style="padding: 0 30px 25px 30px;">
                  <div style="background-color: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #93c5fd; line-height: 1.5;">
                      <strong>Acción sugerida:</strong> Favor revisar en la plataforma la necesidad de renovar, solicitar prórroga o coordinar con los responsables institucionales.
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
    const { test, customEmail, convenioId, tabla } = body;

    const supabase = createAdminClient();

    // Fetch full system configuration
    const { data: configData } = await supabase.from("configuracion_app").select("*").limit(1).single();

    const canalEmailActivo = configData?.canal_email_activo !== false;
    const categoriasActivas = configData?.categorias_activas || [
      "convenios_internacionales_vigentes",
      "convenios_nacionales",
      "convenios_internacionales",
      "convenios_tramite",
      "convenios_redes",
      "convenios_investigacion",
    ];
    const formatoEnvio = configData?.formato_envio || "consolidado";

    let recipients: string[] = configData?.emails_notificacion || [];
    if (customEmail) {
      recipients = [customEmail];
    } else if (recipients.length === 0) {
      recipients = [process.env.NOTIFICATION_EMAIL_TO || "relacionconvenios@umariana.edu.co"];
    }

    const senderEmail = process.env.NOTIFICATION_EMAIL_FROM || "onboarding@resend.dev";

    // 1. Send SPECIFIC AGREEMENT Email Alert
    if (convenioId && tabla) {
      const { data: realItem, error: fetchErr } = await supabase
        .from(tabla)
        .select("*")
        .eq("id", convenioId)
        .single();

      if (fetchErr || !realItem) {
        return NextResponse.json({ error: "Convenio no encontrado para enviar alerta." }, { status: 404 });
      }

      const name = realItem.universidad || realItem.universidad_entidad || realItem.red_nombre || realItem.institucion || realItem.nombre_convenio || "Convenio Sin Nombre";
      const code = realItem.codificacion || realItem.codigo || realItem.item || "Sin Código";
      const country = realItem.pais || realItem.ciudad || realItem.pais_ciudad || "N/A";
      const vencStr = realItem.vigencia_hasta_actual || realItem.vigencia_hasta;

      let dias = 0;
      if (vencStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const vencDate = new Date(vencStr.substring(0, 10) + "T00:00:00");
        if (!isNaN(vencDate.getTime())) {
          const diffMs = vencDate.getTime() - today.getTime();
          dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }

      const emailHTML = buildSingleEmailHTML({
        institucion: name,
        codigo: code,
        pais: country,
        fecha_vencimiento: vencStr ? vencStr.substring(0, 10) : "N/A",
        dias_restantes: dias,
      });

      const { data: emailResult, error: sendError } = await resend.emails.send({
        from: senderEmail,
        to: recipients,
        subject: `🔔 [NOTIFICACIÓN ORI] Alerta de Convenio: ${name} (${code})`,
        html: emailHTML,
      });

      if (sendError) {
        return NextResponse.json({ error: sendError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, emailResult, recipients, item: name });
    }

    // 2. Generic Demo test email
    if (test) {
      const testItem = {
        institucion: "Universidad de Prueba (Demostración ORI)",
        codigo: "RNI-DEMO-2026",
        pais: "Colombia",
        fecha_vencimiento: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        dias_restantes: 15,
      };

      const emailHTML = buildSingleEmailHTML(testItem);

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

    // 3. Dynamic Calculation of Expiring Agreements (Cron Job / Automatic Run)
    if (!canalEmailActivo) {
      return NextResponse.json({ message: "El canal de notificación por correo electrónico se encuentra pausado en configuración." });
    }

    const proximos = await getConveniosProximosVencer(65, categoriasActivas);

    if (!proximos || proximos.length === 0) {
      return NextResponse.json({ message: "No hay convenios pendientes de notificar hoy en las categorías seleccionadas." });
    }

    // Filter items matching active threshold rules
    const itemsToNotify = proximos.filter((item) => {
      const dias = item.dias_restantes;
      if (dias <= 1 && item.notificacion_1dia !== false) return true;
      if (dias > 1 && dias <= 5 && item.notificacion_5dias !== false) return true;
      if (dias > 5 && dias <= 15 && item.notificacion_15dias !== false) return true;
      if (dias > 15 && dias <= 30 && item.notificacion_30dias !== false) return true;
      if (dias > 30 && dias <= 65 && item.notificacion_60dias !== false) return true;
      return false;
    });

    if (itemsToNotify.length === 0) {
      return NextResponse.json({ message: "No hay convenios en las ventanas de notificación configuradas hoy." });
    }

    // Mode A: CONSOLIDATED SUMMARY EMAIL
    if (formatoEnvio === "consolidado") {
      const emailHTML = buildConsolidatedEmailHTML(itemsToNotify);

      const { data: resData, error: sendErr } = await resend.emails.send({
        from: senderEmail,
        to: recipients,
        subject: `📋 [RESUMEN ORI] ${itemsToNotify.length} Convenio(s) Próximos a Vencer - Universidad Mariana`,
        html: emailHTML,
      });

      if (sendErr) {
        return NextResponse.json({ error: sendErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, sentCount: 1, totalItemsNotified: itemsToNotify.length, mode: "consolidado" });
    }

    // Mode B: INDIVIDUAL EMAILS PER AGREEMENT
    let sentCount = 0;
    for (const item of itemsToNotify) {
      const emailHTML = buildSingleEmailHTML(item);

      const { data: resData, error: sendErr } = await resend.emails.send({
        from: senderEmail,
        to: recipients,
        subject: `⚠️ [NOTIFICACIÓN ORI] Convenio Próximo a Vencer (${item.dias_restantes} Días): ${item.institucion || item.codigo}`,
        html: emailHTML,
      });

      if (!sendErr && resData) {
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sentCount, totalItemsNotified: itemsToNotify.length, mode: "individual" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
