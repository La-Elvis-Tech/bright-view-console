import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], messageType = 'normal', userId } = await req.json();
    
    console.log('Recebida mensagem:', { message, messageType, userId });
    
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    let contextData = '';
    
    // Busca de estoque
    if (/estoque|inventário|material/i.test(message)) {
      const { data: stockData } = await supabase
        .from('inventory_items')
        .select('name, current_stock, min_stock')
        .lt('current_stock', supabase.raw('min_stock'))
        .limit(10);
      
      if (stockData?.length) {
        contextData += `\nITENS COM ESTOQUE BAIXO:\n${stockData.map(item => 
          `- ${item.name}: ${item.current_stock} unidades (mínimo: ${item.min_stock})`
        ).join('\n')}`;
      }
    }
    
    // Busca de alertas
    if (/alerta|aviso/i.test(message)) {
      const { data: alertData } = await supabase
        .from('stock_alerts')
        .select('title, priority, status')
        .eq('status', 'active')
        .limit(5);
      
      if (alertData?.length) {
        contextData += `\nALERTAS ATIVOS:\n${alertData.map(alert => 
          `- [${alert.priority}] ${alert.title}`
        ).join('\n')}`;
      }
    }
    
    // Busca de agendamentos (corrigido)
    if (/agendamento|consulta|appointment/i.test(message)) {
      const today = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('patient_name, scheduled_date, status')
        .gte('scheduled_date', `${today}T00:00:00`)
        .lte('scheduled_date', `${today}T23:59:59`)
        .limit(10);
      
      if (appointmentData?.length) {
        contextData += `\nAGENDAMENTOS HOJE:\n${appointmentData.map(apt => {
          const time = new Date(apt.scheduled_date).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          return `- ${apt.patient_name} às ${time} (${apt.status})`;
        }).join('\n')}`;
      }
    }

    // Contexto do sistema
    const laboratoryContext = `
[CONTEXTO DO SISTEMA]
Você é o Elvinho, assistente de gestão laboratorial.
Dados atuais do sistema: ${contextData || 'Nenhum dado relevante encontrado'}

[REGRAS]
- Responda APENAS sobre tópicos laboratoriais
- Seja objetivo e profissional
- Ofereça opções de ação quando possível

[CAPACIDADES]
✅ Análise de estoque
✅ Gestão de agendamentos
✅ Geração de relatórios
✅ Suporte técnico`;

    // Preparar mensagens para a API
    const messages = [
      { role: 'system', content: laboratoryContext },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    // Chamada para Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: messages,
        temperature: 0.2,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      model: 'sonar-deep-research'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ 
      message: "Desculpe, estou com dificuldades técnicas. Como posso ajudar?",
      error: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});