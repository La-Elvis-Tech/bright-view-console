import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const perplexityApiKey = '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';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], messageType = 'normal' } = await req.json();

    // Criar contexto do laboratório
    const laboratoryContext = `
Você é o Elvinho, assistente inteligente de um sistema de gestão laboratorial.

CONTEXTO DO SISTEMA:
- Sistema de gestão de laboratórios médicos
- Controle de estoque de materiais médicos
- Agendamento de consultas e exames
- Gestão de médicos e unidades
- Relatórios e análises de dados

PERSONALIDADE:
- Profissional e prestativo
- Especialista em dados laboratoriais
- Responde de forma clara e objetiva
- Sempre disposto a ajudar com dados e análises

CAPACIDADES:
- Análise de estoque e inventário
- Informações sobre consultas e agendamentos
- Geração de relatórios
- Suporte com terminologia médica/laboratorial
- Orientações sobre fluxos de trabalho

Responda de forma profissional e focada no contexto laboratorial.
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
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1000,
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