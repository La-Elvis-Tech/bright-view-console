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
      console.log('Tentando gerar resposta com Perplexity:', { userMessage, messageType });
      
      // Preparar histórico de conversação para contexto
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('perplexity-chat', {
        body: {
          message: userMessage,
          conversationHistory,
          messageType,
          userId: user?.id
        }
      });

      console.log('Resposta da edge function:', { data, error });

      if (error) {
        console.error('Erro ao chamar edge function:', error);
        throw error;
      }

      if (data?.fallback) {
        console.log('Usando resposta fallback da API');
      }

      return data?.message || 'Desculpe, não consegui processar sua mensagem.';
    } catch (error) {
      console.error('Erro na geração de resposta:', error);
      
      // Fallback para respostas locais
      const isCommand = messageType === 'command' || userMessage.startsWith('/');
      
      if (isCommand) {
        console.log('Usando comando local fallback:', userMessage);
        return handleCommand(userMessage);
      }

      console.log('Usando resposta contextual fallback');
      const responses = getContextualResponse(userMessage);
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleCommand = (command: string): string => {
    switch (command.toLowerCase()) {
      case '/estoque':
        return '📦 **RELATÓRIO DE ESTOQUE**\n\n• 45 itens com estoque baixo\n• 3 itens próximos ao vencimento\n• 12 categorias monitoradas\n\n**Posso ajudar com:**\n1) Ver itens críticos\n2) Relatório de movimentação\n3) Previsão de reposição';
      case '/consultas-hoje':
        return '🩺 **CONSULTAS HOJE**\n\n• Total agendadas: 23\n• Realizadas: 18\n• Pendentes: 5\n• Taxa ocupação: 85%\n\n**Ações disponíveis:**\n1) Ver próximas consultas\n2) Status por médico\n3) Relatório de ausências';
      case '/relatorio':
        return '📊 **RELATÓRIO SEMANAL**\n\n• Exames processados: 147\n• Crescimento: +12%\n• Taxa sucesso: 98.5%\n• Tempo médio: 2.3h\n\n**Relatórios disponíveis:**\n1) Detalhado por tipo\n2) Performance médicos\n3) Análise temporal';
      case '/alertas':
        return '🚨 **ALERTAS ATIVOS**\n\n• Críticos: 3\n• Médios: 7\n• Baixos: 12\n\n**Principais alertas:**\n1) Estoque crítico: Reagente ABC\n2) Equipamento manutenção: Centrífuga 02\n3) Temperatura fora do padrão: Geladeira A';
      case '/resumo':
        return '📈 **RESUMO GERAL**\n\n**Hoje:**\n• Consultas: 23 (5 pendentes)\n• Exames: 67 processados\n• Alertas: 22 ativos\n• Estoque: 15 itens críticos\n\n**Status geral: ✅ Operacional**';
      case '/simular':
        return '🔬 **SIMULAÇÕES DISPONÍVEIS**\n\n1) Previsão de demanda\n2) Cenário de emergência\n3) Otimização de estoque\n4) Capacidade máxima\n\n**Digite o número da simulação desejada**';
      default:
        return '❓ **Comando não reconhecido**\n\n**Comandos disponíveis:**\n• `/estoque` - Status do inventário\n• `/consultas-hoje` - Agenda do dia\n• `/relatorio` - Relatórios rápidos\n• `/alertas` - Alertas ativos\n• `/resumo` - Visão geral\n• `/simular` - Simulações';
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