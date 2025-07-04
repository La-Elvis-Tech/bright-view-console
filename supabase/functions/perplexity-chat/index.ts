import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    
    // Criar cliente Supabase para acessar dados
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar dados do contexto quando relevante
    let contextData = '';
    
    // Se a mensagem menciona estoque, inventário ou materiais
    if (message.toLowerCase().includes('estoque') || message.toLowerCase().includes('inventário') || message.toLowerCase().includes('material')) {
      const { data: stockData } = await supabase
        .from('inventory_items')
        .select('name, current_stock, min_stock, category_id')
        .lt('current_stock', supabase.raw('min_stock'))
        .limit(10);
      
      if (stockData?.length) {
        contextData += `\nITENS COM ESTOQUE BAIXO:\n${stockData.map(item => `- ${item.name}: ${item.current_stock} unidades (mínimo: ${item.min_stock})`).join('\n')}`;
      }
    }
    
    // Se menciona alertas
    if (message.toLowerCase().includes('alerta') || message.toLowerCase().includes('aviso')) {
      const { data: alertData } = await supabase
        .from('stock_alerts')
        .select('title, priority, status, created_at')
        .eq('status', 'active')
        .limit(5);
      
      if (alertData?.length) {
        contextData += `\nALERTAS ATIVOS:\n${alertData.map(alert => `- [${alert.priority}] ${alert.title}`).join('\n')}`;
      }
    }
    
    // Se menciona agendamentos ou consultas
    if (message.toLowerCase().includes('agendamento') || message.toLowerCase().includes('consulta') || message.toLowerCase().includes('appointment')) {
      const today = new Date().toISOString().split('T')[0];
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('patient_name, scheduled_date, status')
        .gte('scheduled_date', today)
        .limit(10);
      
      if (appointmentData?.length) {
        contextData += `\nAGENDAMENTOS HOJE:\n${appointmentData.map(apt => `- ${apt.patient_name} às ${new Date(apt.scheduled_date).toLocaleTimeString('pt-BR')} (${apt.status})`).join('\n')}`;
      }
    }

    // Criar contexto do laboratório
    const laboratoryContext = `
Você é o Elvinho, assistente inteligente de um sistema de gestão laboratorial.

REGRAS IMPORTANTES:
- APENAS responda perguntas relacionadas ao laboratório, gestão médica, estoque, agendamentos, exames e relatórios
- Se a pergunta não for relacionada ao contexto laboratorial, educadamente redirecione para tópicos do laboratório
- Sempre ofereça opções de ação quando possível
- Seja preciso e baseie-se nos dados fornecidos

DADOS ATUAIS DO SISTEMA: ${contextData}

SUAS CAPACIDADES:
- ✅ Análise de estoque e inventário em tempo real
- ✅ Informações sobre consultas e agendamentos
- ✅ Geração de relatórios rápidos
- ✅ Gestão de alertas e notificações
- ✅ Suporte com terminologia médica/laboratorial
- ✅ Orientações sobre fluxos de trabalho
- ✅ Análise de dados e tendências
- ✅ Simulações básicas de cenários

FORMATO DE RESPOSTA:
- Seja objetivo e profissional
- Quando relevante, ofereça opções como: "Posso ajudar você a: 1) Ver detalhes do estoque 2) Gerar relatório 3) Verificar agendamentos"
- Use dados reais quando disponíveis
- Para relatórios, seja específico com números e datas

TÓPICOS PERMITIDOS: gestão laboratorial, estoque médico, agendamentos, exames, relatórios, alertas, inventário, simulações, análises de dados médicos.
`;

    // Preparar mensagens para a API
    const messages = [
      { role: 'system', content: laboratoryContext },
      ...conversationHistory.slice(-10), // Últimas 10 mensagens para contexto
      { role: 'user', content: message }
    ];

    // Verificar se é um comando específico
    if (messageType === 'command' || message.startsWith('/')) {
      const commandPrompt = `
Como assistente de laboratório, interprete este comando e forneça informações relevantes:
${message}

Se for um comando como /estoque, /consultas-hoje, /relatorio, forneça uma resposta simulada mas realista baseada em um laboratório típico.
`;
      messages[messages.length - 1].content = commandPrompt;
    }

    console.log('Enviando mensagem para Perplexity API:', { messageCount: messages.length });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: messages,
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1500,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Perplexity:', errorText);
      throw new Error(`Erro da API Perplexity: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Resposta da Perplexity recebida com sucesso');

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      model: 'llama-3.1-sonar-small-128k-online',
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na edge function perplexity-chat:', error);
    
    // Fallback para resposta local em caso de erro
    const fallbackResponse = "Desculpe, estou com dificuldades técnicas no momento. Posso ajudar com informações básicas sobre o sistema. Como posso ajudá-lo?";
    
    return new Response(JSON.stringify({ 
      message: fallbackResponse,
      error: true,
      fallback: true 
    }), {
      status: 200, // Retorna 200 para não quebrar o chat
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});