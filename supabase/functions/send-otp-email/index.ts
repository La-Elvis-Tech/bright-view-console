
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  code: string;
  userEmail: string;
  adminEmail: string;
  type: 'login' | 'signup' | 'password_reset';
}

const getOTPEmailTemplate = (data: OTPEmailRequest) => {
  const typeNames = {
    login: 'Login',
    signup: 'Cadastro',
    password_reset: 'Redefinição de Senha'
  };

  const typeIcons = {
    login: '🔐',
    signup: '👋',
    password_reset: '🔑'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Verificação</title>
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
              <span style="font-size: 32px;">${typeIcons[data.type]}</span>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
              Código de Verificação
            </h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">
              ${typeNames[data.type]} solicitado
            </p>
          </div>

          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 2px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
              Usuário
            </p>
            <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; font-weight: 600;">
              ${data.userEmail}
            </p>
            
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
              Seu código de verificação
            </p>
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; padding: 16px 24px; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">
              ${data.code}
            </div>
          </div>

          <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 16px; margin-right: 8px;">⏰</span>
              <span style="color: #92400e; font-weight: 600; font-size: 14px;">Importante</span>
            </div>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
              Este código é válido por apenas <strong>10 minutos</strong>. Use-o imediatamente para ${typeNames[data.type].toLowerCase()}.
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://laelvistech.netlify.app/auth" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              🚀 Acessar Sistema
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
            Se você não solicitou este código, pode ignorar este email com segurança.
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
    const { code, userEmail, adminEmail, type }: OTPEmailRequest = await req.json();
    
    console.log('Enviando código OTP por email:', { userEmail, adminEmail, type });

    const emailResponse = await resend.emails.send({
      from: "La Elvis Tech <auth@dasalabs.com>",
      to: [adminEmail],
      subject: `🔐 Código OTP - ${userEmail}`,
      html: getOTPEmailTemplate({ code, userEmail, adminEmail, type }),
    });

    console.log("Email OTP enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email OTP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
