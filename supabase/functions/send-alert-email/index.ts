
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  type: 'stock' | 'expiry' | 'prediction';
  title: string;
  description: string;
  item: string;
  priority: 'critical' | 'high' | 'medium';
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: string;
  lot?: string;
  predictedDate?: string;
  adminEmail: string;
}

const getEmailTemplate = (alertData: AlertEmailRequest) => {
  const priorityColors = {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#CA8A04'
  };

  const priorityLabels = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Médio'
  };

  const typeLabels = {
    stock: 'Estoque Baixo',
    expiry: 'Vencimento Próximo',
    prediction: 'Predição de Ruptura'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta do Sistema</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; background-color: #ffffff; padding: 12px; border-radius: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px; display: inline-block;"></div>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
            La Elvis Tech
          </h1>
          <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 16px;">
            Sistema de Gestão Laboratorial
          </p>
        </div>

        <!-- Alert Banner -->
        <div style="background-color: ${priorityColors[alertData.priority]}; padding: 16px 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">
            🚨 Alerta ${priorityLabels[alertData.priority]} - ${typeLabels[alertData.type]}
          </h2>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid ${priorityColors[alertData.priority]};">
            <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              ${alertData.title}
            </h3>
            <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
              ${alertData.description}
            </p>
            
            <div style="background-color: #ffffff; border-radius: 6px; padding: 16px; border: 1px solid #e5e7eb;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Item:</span>
                  <p style="color: #1f2937; margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${alertData.item}</p>
                </div>
                <div>
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Prioridade:</span>
                  <p style="color: ${priorityColors[alertData.priority]}; margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${priorityLabels[alertData.priority]}</p>
                </div>
              </div>
            </div>
          </div>

          ${alertData.currentStock && alertData.minStock ? `
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #fbbf24;">
            <h4 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">📊 Informações de Estoque</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <span style="color: #92400e; font-size: 14px; font-weight: 500;">Estoque Atual:</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${alertData.currentStock} ${alertData.unit || 'unidades'}</p>
              </div>
              <div>
                <span style="color: #92400e; font-size: 14px; font-weight: 500;">Estoque Mínimo:</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${alertData.minStock} ${alertData.unit || 'unidades'}</p>
              </div>
            </div>
          </div>
          ` : ''}

          ${alertData.expiryDate ? `
          <div style="background-color: #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #f87171;">
            <h4 style="color: #991b1b; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">📅 Data de Vencimento</h4>
            <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 700;">${alertData.expiryDate}</p>
            ${alertData.lot ? `<p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Lote: ${alertData.lot}</p>` : ''}
          </div>
          ` : ''}

          ${alertData.predictedDate ? `
          <div style="background-color: #e0e7ff; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #818cf8;">
            <h4 style="color: #3730a3; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🔮 Predição</h4>
            <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 700;">Data Prevista de Ruptura: ${alertData.predictedDate}</p>
          </div>
          ` : ''}

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://laelvistech.netlify.app/inventory" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              📋 Acessar Sistema
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
            Este é um alerta automático do Sistema de Gestão La Elvis Tech
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Data/Hora: ${new Date().toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alertData: AlertEmailRequest = await req.json();
    
    console.log('Enviando alerta por email:', alertData);

    const emailResponse = await resend.emails.send({
      from: "La Elvis Tech <alerts@dasalabs.com>",
      to: [alertData.adminEmail],
      subject: `🚨 ${alertData.priority.toUpperCase()} - ${alertData.title}`,
      html: getEmailTemplate(alertData),
    });

    console.log("Email de alerta enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de alerta:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
