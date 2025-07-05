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
    
    // Verificar se o assunto é relacionado ao laboratório
    const laboratoryTopics = /estoque|inventário|material|exame|consulta|agendamento|paciente|médico|relatório|alerta|laboratório|análise|sangue|tubo|reagente|equipamento|fornecedor|categoria|unidade|oi|olá|hello|ajuda|help/i;
    const isLabRelated = laboratoryTopics.test(message);
    
    if (!isLabRelated) {
      return new Response(JSON.stringify({ 
        message: "Desculpe, sou especializado apenas em gestão laboratorial. Posso ajudar com estoque, consultas, exames, relatórios e outras atividades do laboratório. Como posso auxiliar você?",
        filtered: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    let contextData = '';
    
    // Sempre buscar dados básicos do sistema
    const [stockData, alertData, appointmentData, categoriesData] = await Promise.all([
      // Estoque crítico
      supabase
        .from('inventory_items')
        .select('name, current_stock, min_stock, unit_measure')
        .lt('current_stock', supabase.raw('min_stock'))
        .eq('active', true)
        .limit(10),
      
      // Alertas ativos
      supabase
        .from('stock_alerts')
        .select('title, priority, status, alert_type')
        .eq('status', 'active')
        .limit(5),
      
      // Agendamentos de hoje
      supabase
        .from('appointments')
        .select('patient_name, scheduled_date, status')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .lt('scheduled_date', new Date(Date.now() + 86400000).toISOString().split('T')[0])
        .limit(10),
        
      // Categorias de inventário
      supabase
        .from('inventory_categories')
        .select('name, description')
        .limit(10)
    ]);

    // Montar contexto com dados reais
    if (stockData.data?.length) {
      contextData += `\n📦 ESTOQUE CRÍTICO (${stockData.data.length} itens):\n${stockData.data.map(item => 
        `• ${item.name}: ${item.current_stock} ${item.unit_measure} (mín: ${item.min_stock})`
      ).join('\n')}\n`;
    }
    
    if (alertData.data?.length) {
      contextData += `\n🚨 ALERTAS ATIVOS (${alertData.data.length}):\n${alertData.data.map(alert => 
        `• [${alert.priority.toUpperCase()}] ${alert.title}`
      ).join('\n')}\n`;
    }
    
    if (appointmentData.data?.length) {
      contextData += `\n📅 CONSULTAS HOJE (${appointmentData.data.length}):\n${appointmentData.data.map(apt => {
        const time = new Date(apt.scheduled_date).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        return `• ${apt.patient_name} às ${time} - ${apt.status}`;
      }).join('\n')}\n`;
    }
    
    if (categoriesData.data?.length) {
      contextData += `\n📂 CATEGORIAS DISPONÍVEIS:\n${categoriesData.data.map(cat => 
        `• ${cat.name}${cat.description ? ` - ${cat.description}` : ''}`
      ).join('\n')}\n`;
    }

    // Contexto do sistema com dados reais
    const laboratoryContext = `
[ELVINHO - ASSISTENTE LABORATORIAL]
Você é o Elvinho, assistente inteligente especializado em gestão laboratorial.

[DADOS DO SISTEMA ATUAL]
${contextData || 'Sistema operacional - aguardando consultas específicas'}

[REGRAS IMPORTANTES]
- Responda APENAS sobre gestão laboratorial
- Use os dados reais do sistema fornecidos acima
- Seja preciso, objetivo e profissional
- Ofereça ações práticas baseadas nos dados
- Se não tiver dados específicos, explique como obter

[SUAS CAPACIDADES]
✅ Consulta de estoque em tempo real
✅ Análise de alertas e problemas
✅ Gestão de agendamentos e consultas
✅ Relatórios e estatísticas
✅ Suporte técnico especializado
✅ Recomendações baseadas em dados

[INSTRUÇÕES DE RESPOSTA]
- Seja conversacional e amigável
- Forneça informações específicas quando disponível
- Se não houver dados específicos, sugira como obter as informações
- Mantenha foco exclusivo em assuntos laboratoriais`;

    // Preparar mensagens para a API
    const messages = [
      { role: 'system', content: laboratoryContext },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    console.log('Enviando para Perplexity:', { model: 'sonar-deep-research', messageCount: messages.length });

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
        temperature: 0.3,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false
      }),
    });

    console.log('Status da resposta Perplexity:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Perplexity:', { status: response.status, error: errorText });
      throw new Error(`Erro da API Perplexity: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Dados recebidos da Perplexity:', { hasChoices: !!data.choices, choicesLength: data.choices?.length });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Estrutura de resposta inválida:', data);
      throw new Error('Resposta da API em formato inválido');
    }

    const assistantMessage = data.choices[0].message.content;
    console.log('Mensagem do assistente extraída:', { messageLength: assistantMessage?.length });

    const result = { 
      message: assistantMessage,
      model: 'sonar-deep-research',
      success: true
    };

    console.log('Retornando resultado:', { hasMessage: !!result.message, model: result.model });

    return new Response(JSON.stringify(result), {
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