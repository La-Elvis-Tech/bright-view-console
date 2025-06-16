
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  code: string;
  role: 'admin' | 'user' | 'supervisor';
  maxUses: number;
  expiresHours: number;
  adminEmail: string;
}

const getInviteEmailTemplate = (data: InviteEmailRequest) => {
  const roleNames = {
    admin: 'Administrador',
    user: 'Usuário',
    supervisor: 'Supervisor'
  };

  const roleIcons = {
    admin: '👑',
    user: '👤',
    supervisor: '📊'
  };

  const roleColors = {
    admin: '#dc2626',
    user: '#059669',
    supervisor: '#7c3aed'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Convite</title>
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

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background-color: #dbeafe; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
              <span style="font-size: 32px;">📧</span>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
              Código de Convite Gerado
            </h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">
              Convide novos usuários para o sistema
            </p>
          </div>

          <!-- Invite Code Box -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 2px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
              Código de Convite
            </p>
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; padding: 16px 24px; border-radius: 8px; font-size: 24px; font-weight: 700; letter-spacing: 2px; margin: 12px 0;">
              ${data.code}
            </div>
          </div>

          <!-- Role Info -->
          <div style="background-color: ${roleColors[data.role]}15; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${roleColors[data.role]};">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 20px; margin-right: 12px;">${roleIcons[data.role]}</span>
              <span style="color: ${roleColors[data.role]}; font-weight: 700; font-size: 16px;">Tipo de Usuário: ${roleNames[data.role]}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
              <div>
                <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Usos Máximos:</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${data.maxUses}</p>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Expira em:</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${data.expiresHours} horas</p>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div style="background-color: #e0f2fe; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #0284c7;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 16px; margin-right: 8px;">💡</span>
              <span style="color: #0c4a6e; font-weight: 600; font-size: 14px;">Como usar</span>
            </div>
            <p style="color: #0c4a6e; margin: 0; font-size: 14px; line-height: 1.5;">
              Compartilhe este código com as pessoas que você deseja convidar para o sistema. Eles poderão usar o código durante o processo de cadastro.
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://laelvistech.netlify.app/invite-codes" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              📋 Gerenciar Convites
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
            Código gerado automaticamente pelo Sistema de Gestão La Elvis Tech
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
    const { code, role, maxUses, expiresHours, adminEmail }: InviteEmailRequest = await req.json();
    
    console.log('Enviando código de convite por email:', { role, maxUses, expiresHours });

    const emailResponse = await resend.emails.send({
      from: "La Elvis Tech <invites@dasalabs.com>",
      to: [adminEmail],
      subject: `📧 Código de Convite Gerado - ${role}`,
      html: getInviteEmailTemplate({ code, role, maxUses, expiresHours, adminEmail }),
    });

    console.log("Email de convite enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de convite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
