import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;

// Rate limiter para controle de custos
class CostLimiter {
  private usage: Map<string, { count: number; resetTime: number }> = new Map();
  private dailyLimit = 20; // 20 mensagens por usuário por dia
  
  canProceed(userId: string): boolean {
    const now = Date.now();
    const dayStart = new Date().setHours(0, 0, 0, 0);
    
    const userUsage = this.usage.get(userId);
    if (!userUsage || now > userUsage.resetTime) {
      this.usage.set(userId, { count: 1, resetTime: dayStart + 86400000 });
      return true;
    }
    
    if (userUsage.count >= this.dailyLimit) {
      return false;
    }
    
    userUsage.count++;
    return true;
  }
  
  getRemainingRequests(userId: string): number {
    const userUsage = this.usage.get(userId);
    if (!userUsage || Date.now() > userUsage.resetTime) {
      return this.dailyLimit;
    }
    return Math.max(0, this.dailyLimit - userUsage.count);
  }
}

const costLimiter = new CostLimiter();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], userId } = await req.json();
    
    console.log('🔄 Processando mensagem:', { message, userId });
    
    // Verificar limite de custos
    if (!costLimiter.canProceed(userId)) {
      const remaining = costLimiter.getRemainingRequests(userId);
      return new Response(JSON.stringify({ 
        message: `Limite diário atingido! Você pode fazer mais ${remaining} perguntas amanhã. Isso ajuda a controlar os custos do sistema.`,
        limited: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Aceitar qualquer mensagem relacionada ao laboratório (regex mais ampla)
    const labKeywords = /estoque|inventário|material|exame|consulta|agendamento|paciente|médico|relatório|alerta|laboratório|análise|sangue|tubo|reagente|equipamento|fornecedor|categoria|unidade|item|stock|alert|appointment|doctor|patient|exam|inventory|supply|lab|medicine|health|saúde|medicamento|clínica|hospital|teste|resultado|amostra|coleta|análise|bioquímica|hematologia|microbiologia|oi|olá|hello|hi|ajuda|help|como|what|o que|qual|quais|quantos|quantas|resumo|status|situação|\/|relatorio|consultas|hoje|baixo/i;
    
    const isLabRelated = labKeywords.test(message) || message.startsWith('/') || message.length < 50;
    
    if (!isLabRelated) {
      console.log('❌ Mensagem filtrada:', message);
      return new Response(JSON.stringify({ 
        message: "Desculpe, sou especializado apenas em gestão laboratorial. Posso ajudar com estoque, consultas, exames, relatórios e outras atividades do laboratório. Como posso auxiliar você?",
        filtered: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('✅ Mensagem aprovada para processamento');
    
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fazer consultas diretas ao banco quando necessário
    let dbData = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('estoque') || lowerMessage.includes('baixo') || lowerMessage.includes('falta')) {
      try {
        const { data: lowStock } = await supabase
          .from('inventory_items')
          .select('name, current_stock, min_stock, unit_measure')
          .lt('current_stock', supabase.raw('min_stock'))
          .eq('active', true)
          .limit(5);
        
        if (lowStock?.length) {
          dbData = `📦 ESTOQUE CRÍTICO:\n${lowStock.map(item => 
            `• ${item.name}: ${item.current_stock} ${item.unit_measure} (mín: ${item.min_stock})`
          ).join('\n')}\n`;
        } else {
          dbData = '✅ Nenhum item com estoque crítico no momento.\n';
        }
      } catch (error) {
        console.error('Erro ao consultar estoque:', error);
      }
    }

    if (lowerMessage.includes('consulta') || lowerMessage.includes('agendamento') || lowerMessage.includes('hoje')) {
      try {
        const { data: appointments } = await supabase
          .from('appointments')
          .select('patient_name, scheduled_date, status')
          .gte('scheduled_date', new Date().toISOString().split('T')[0])
          .lt('scheduled_date', new Date(Date.now() + 86400000).toISOString().split('T')[0])
          .limit(5);
        
        if (appointments?.length) {
          dbData += `📅 CONSULTAS HOJE:\n${appointments.map(apt => {
            const time = new Date(apt.scheduled_date).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            return `• ${apt.patient_name} às ${time} - ${apt.status}`;
          }).join('\n')}\n`;
        } else {
          dbData += '📅 Nenhuma consulta agendada para hoje.\n';
        }
      } catch (error) {
        console.error('Erro ao consultar agendamentos:', error);
      }
    }

    if (lowerMessage.includes('alerta')) {
      try {
        const { data: alerts } = await supabase
          .from('stock_alerts')
          .select('title, priority, status')
          .eq('status', 'active')
          .limit(3);
        
        if (alerts?.length) {
          dbData += `🚨 ALERTAS ATIVOS:\n${alerts.map(alert => 
            `• [${alert.priority.toUpperCase()}] ${alert.title}`
          ).join('\n')}\n`;
        } else {
          dbData += '✅ Nenhum alerta ativo no momento.\n';
        }
      } catch (error) {
        console.error('Erro ao consultar alertas:', error);
      }
    }

    // Contexto simplificado com dados reais
    const laboratoryContext = `Você é o Elvinho, assistente do laboratório.

${dbData || 'Sistema operacional - pronto para consultas.'}

INSTRUÇÕES:
- Seja CONCISO e OBJETIVO (máximo 150 palavras)
- Use os dados acima para responder
- Seja direto e prático
- Foque no essencial
- Responda apenas sobre laboratório`;

    // Preparar mensagens para a API
    const messages = [
      { role: 'system', content: laboratoryContext },
      ...conversationHistory.slice(-3), // Histórico ainda mais reduzido
      { role: 'user', content: message }
    ];

    console.log('🔄 Enviando para Perplexity API...');

    // Chamada para Perplexity API com modelo mais barato
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: messages,
        temperature: 0.2,
        max_tokens: 200,
        return_images: false,
        return_related_questions: false
      }),
    });

    console.log('📡 Status da resposta Perplexity:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Perplexity:', { status: response.status, error: errorText });
      throw new Error(`Erro da API Perplexity: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Dados recebidos:', { hasChoices: !!data.choices, choicesLength: data.choices?.length });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('💥 Estrutura de resposta inválida:', data);
      throw new Error('Resposta da API em formato inválido');
    }

    const assistantMessage = data.choices[0].message.content;
    console.log('✅ Mensagem extraída:', { messageLength: assistantMessage?.length });

    const result = { 
      message: assistantMessage,
      model: 'llama-3.1-sonar-large-128k-online',
      success: true
    };

    console.log('🎯 Retornando resultado bem-sucedido');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erro geral:', error);
    return new Response(JSON.stringify({ 
      message: "Desculpe, estou com dificuldades técnicas. Tente reformular sua pergunta sobre o laboratório.",
      error: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});