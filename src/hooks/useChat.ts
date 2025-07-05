import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'user' | 'elvinho';
  message_type: 'normal' | 'command';
  created_at: string;
}

export const useChat = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Carregar conversas do usuário
  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as conversas.',
        variant: 'destructive'
      });
    }
  };

  // Carregar mensagens de uma conversa
  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar nova conversa
  const createConversation = async (firstMessage?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: firstMessage ? firstMessage.substring(0, 50) + '...' : 'Nova Conversa'
        })
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data);
      setMessages([]);
      
      return data;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar nova conversa.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Enviar mensagem
  const sendMessage = async (content: string, messageType: 'normal' | 'command' = 'normal') => {
    if (!user || !currentConversation) return;

    try {
      // Adicionar mensagem do usuário
      const userMessage = {
        conversation_id: currentConversation.id,
        content,
        sender: 'user' as const,
        message_type: messageType
      };

      const { data: userMsgData, error: userError } = await supabase
        .from('chat_messages')
        .insert(userMessage)
        .select()
        .single();

      if (userError) throw userError;

      setMessages(prev => [...prev, userMsgData as ChatMessage]);

      // Simular resposta do Elvinho
      setIsTyping(true);
      const elvinhoResponse = await generateElvinhoResponse(content, messageType);
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      const elvinhoMessage = {
        conversation_id: currentConversation.id,
        content: elvinhoResponse,
        sender: 'elvinho' as const,
        message_type: messageType === 'command' ? 'command' : 'normal'
      };

      const { data: elvinhoMsgData, error: elvinhoError } = await supabase
        .from('chat_messages')
        .insert(elvinhoMessage)
        .select()
        .single();

      if (elvinhoError) throw elvinhoError;

      setMessages(prev => [...prev, elvinhoMsgData as ChatMessage]);

      // Atualizar timestamp da conversa
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation.id);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive'
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Gerar resposta do Elvinho usando Perplexity AI
  const generateElvinhoResponse = async (userMessage: string, messageType: 'normal' | 'command'): Promise<string> => {
    try {
      console.log('🤖 Elvinho gerando resposta:', { userMessage, messageType });
      
      // Preparar histórico de conversação limitado
      const conversationHistory = messages.slice(-4).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      console.log('📡 Chamando edge function...');
      
      const { data, error } = await supabase.functions.invoke('perplexity-chat', {
        body: {
          message: userMessage,
          conversationHistory,
          messageType,
          userId: user?.id
        }
      });

      console.log('✅ Resposta recebida:', { success: !!data, hasError: !!error, filtered: data?.filtered });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      // Se foi filtrado por assunto não relacionado
      if (data?.filtered) {
        return data.message;
      }

      return data?.message || 'Desculpe, houve um problema técnico. Tente novamente.';
      
    } catch (error) {
      console.error('💥 Erro na comunicação com Elvinho:', error);
      
      // Fallback melhorado
      const isCommand = messageType === 'command' || userMessage.startsWith('/');
      
      if (isCommand) {
        console.log('🔄 Usando comando local como fallback');
        return handleCommand(userMessage);
      }

      // Resposta de erro mais útil
      return `Desculpe, estou com dificuldades técnicas no momento. 

Você pode tentar:
• Usar comandos rápidos como /estoque ou /resumo
• Reformular sua pergunta de forma mais específica
• Aguardar alguns segundos e tentar novamente

Como posso ajudar de outra forma?`;
    }
  };

  const handleCommand = (command: string): string => {
    switch (command.toLowerCase()) {
      case '/estoque':
        return `📦 **RELATÓRIO DE ESTOQUE**

🔍 **Status Atual:**
• Consultando itens com estoque baixo...
• Verificando prazos de validade...
• Analisando movimentações recentes...

💡 **Dica:** Pergunte "quais itens estão com estoque baixo?" para dados em tempo real!

**Posso ajudar com:**
• Consulta de itens específicos
• Relatório de movimentação
• Previsão de reposição
• Análise por categoria`;

      case '/consultas-hoje':
        return `🩺 **AGENDA DO DIA**

📅 **Consultando agendamentos de hoje...**
• Verificando consultas confirmadas
• Checando horários disponíveis
• Analisando ocupação médica

💡 **Dica:** Pergunte "quantas consultas temos hoje?" para informações atualizadas!

**Ações disponíveis:**
• Ver próximas consultas
• Status por médico
• Relatório de ausências
• Reagendamentos necessários`;

      case '/relatorio':
        return `📊 **RELATÓRIOS DISPONÍVEIS**

📈 **Tipos de Relatório:**
• Relatório de estoque
• Performance de consultas
• Análise de exames
• Alertas e incidentes
• Movimentação financeira

💡 **Dica:** Seja específico! "Relatório de estoque semanal" ou "Performance do mês"

**Como solicitar:**
• Especifique o período desejado
• Mencione métricas importantes
• Indique formato preferido`;

      case '/alertas':
        return `🚨 **SISTEMA DE ALERTAS**

⚡ **Verificando alertas ativos...**
• Estoque crítico
• Equipamentos em manutenção
• Vencimentos próximos
• Anomalias no sistema

💡 **Dica:** Pergunte "que alertas temos ativos?" para lista completa!

**Tipos de Alerta:**
• 🔴 Críticos (ação imediata)
• 🟡 Médios (atenção necessária)
• 🟢 Informativos (monitoramento)`;

      case '/resumo':
        return `📈 **PAINEL EXECUTIVO**

🏥 **Status do Laboratório:**
• Consultando indicadores principais...
• Analisando performance operacional...
• Verificando alertas críticos...

💡 **Dica:** Para dados específicos, pergunte "qual o status geral do laboratório?"

**Métricas Principais:**
• Consultas realizadas/agendadas
• Estoque crítico
• Alertas ativos
• Performance por unidade`;

      case '/ajuda':
      case '/help':
        return `🤖 **ELVINHO - GUIA RÁPIDO**

**Como usar:**
• Faça perguntas naturais sobre o laboratório
• Use comandos / para respostas rápidas
• Seja específico para melhores resultados

**Exemplos de perguntas:**
• "Quais itens estão com estoque baixo?"
• "Quantas consultas temos hoje?"
• "Há alertas críticos ativos?"
• "Qual fornecedor do item X?"

**Comandos disponíveis:**
• /estoque • /consultas-hoje • /alertas
• /relatorio • /resumo • /ajuda`;

      default:
        return `❓ **Comando não reconhecido: ${command}**

**Comandos disponíveis:**
• \`/estoque\` - Status do inventário
• \`/consultas-hoje\` - Agenda do dia  
• \`/relatorio\` - Relatórios disponíveis
• \`/alertas\` - Alertas do sistema
• \`/resumo\` - Painel executivo
• \`/ajuda\` - Este guia

💡 **Dica:** Você também pode fazer perguntas naturais como "quantos itens estão em falta?" ou "qual o status das consultas?"`;
    }
  };

  const getContextualResponse = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('hello')) {
      return [
        'Olá! Sou o Elvinho, seu assistente inteligente de laboratório. Como posso ajudar você hoje?',
        'Oi! Estou aqui para ajudar com todas as suas necessidades laboratoriais.',
        'Olá! Pronto para te auxiliar com dados, relatórios e muito mais!'
      ];
    }

    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
      return [
        'Estou aqui para ajudar! Posso auxiliar com estoque, consultas, relatórios e análises de dados. O que você precisa?',
        'Claro! Sou especialista em dados laboratoriais. Me diga como posso ajudar.',
        'Conte comigo! Estou preparado para resolver suas dúvidas sobre o laboratório.'
      ];
    }

    if (lowerMessage.includes('estoque') || lowerMessage.includes('inventário')) {
      return [
        'Perfeito! Tenho acesso completo aos dados de estoque. Posso mostrar relatórios, alertas e previsões. O que você gostaria de ver?',
        'Estoque é minha especialidade! Temos controle total dos materiais e posso gerar relatórios detalhados.',
        'Ótimo! Posso ajudar com análises de estoque, materiais em falta e previsões de consumo.'
      ];
    }

    if (lowerMessage.includes('consulta') || lowerMessage.includes('agendamento')) {
      return [
        'Posso ajudar com informações sobre consultas! Tenho dados sobre horários, médicos e estatísticas. O que você precisa saber?',
        'Consultas e agendamentos são minha área! Posso mostrar dados em tempo real e relatórios.',
        'Perfeito! Tenho acesso aos dados de agendamento e posso fornecer informações detalhadas.'
      ];
    }

    if (lowerMessage.includes('relatório') || lowerMessage.includes('dados')) {
      return [
        'Excelente! Sou especialista em relatórios e análise de dados. Posso gerar relatórios customizados e insights valiosos.',
        'Relatórios são minha paixão! Posso criar análises detalhadas com métricas em tempo real.',
        'Ótimo! Tenho ferramentas avançadas para análise de dados e geração de relatórios personalizados.'
      ];
    }

    if (lowerMessage.includes('obrigado') || lowerMessage.includes('thanks')) {
      return [
        'De nada! Foi um prazer ajudar. Estou sempre aqui quando precisar!',
        'Fico feliz em ajudar! Conte comigo sempre que precisar de suporte.',
        'Por nada! Estou sempre disponível para auxiliar você.'
      ];
    }

    // Respostas padrão
    return [
      'Interessante! Me conte mais sobre isso. Como posso ajudar especificamente?',
      'Entendi. Poderia fornecer mais detalhes para eu poder ajudar melhor?',
      'Compreendo. Que tipo de informação ou análise você precisa sobre isso?',
      'Perfeito! Explique um pouco mais para eu poder fornecer a melhor assistência.',
      'Ótima pergunta! Me dê mais contexto para eu poder ajudar de forma mais precisa.'
    ];
  };

  // Selecionar conversa
  const selectConversation = (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
  };

  // Deletar conversa
  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }

      toast({
        title: 'Conversa excluída',
        description: 'A conversa foi excluída com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a conversa.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    isTyping,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    loadConversations
  };
};