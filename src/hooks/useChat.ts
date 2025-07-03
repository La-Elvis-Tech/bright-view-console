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

  // Gerar resposta do Elvinho com personalidade Elvis
  const generateElvinhoResponse = async (userMessage: string, messageType: 'normal' | 'command'): Promise<string> => {
    const isCommand = messageType === 'command' || userMessage.startsWith('/');
    
    if (isCommand) {
      return handleCommand(userMessage);
    }

    // Respostas baseadas em contexto com personalidade do Elvis
    const responses = getContextualResponse(userMessage);
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleCommand = (command: string): string => {
    switch (command.toLowerCase()) {
      case '/estoque':
        return '🎸 Tchan tchan! Consultando o estoque para você, baby! Encontrei 45 itens com estoque baixo e 3 itens próximos ao vencimento. Que tal verificarmos juntos? Can\'t help falling in love with essa organização!';
      case '/consultas-hoje':
        return '🕺 All shook up com as consultas de hoje! Temos 23 agendadas, 18 já realizadas e 5 pendentes. A taxa de ocupação está em 85% - that\'s what I call rockin\'!';
      case '/relatorio':
        return '📊 Don\'t be cruel, deixa o Rei dos relatórios trabalhar! Esta semana processamos 147 exames, com crescimento de 12% - estamos burning love para os números!';
      default:
        return '🤔 Hmm, esse comando não tá no meu repertório, hunny! Comandos disponíveis: /estoque, /consultas-hoje, /relatorio. Thank ya, thank ya very much!';
    }
  };

  const getContextualResponse = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('hello')) {
      return [
        '🎸 Well hello there, hunny! Sou o Elvinho, o Rei do laboratório! Como posso ajudar você hoje?',
        '🕺 Oi baby! Elvinho aqui, pronto para rock and roll com seus dados laboratoriais!',
        '👑 Hey gorgeous! O Rei chegou para deixar seu dia all shook up de tanta eficiência!'
      ];
    }

    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
      return [
        '🎤 Don\'t worry baby, o Elvinho tá aqui! Posso ajudar com estoque, consultas, relatórios e muito mais. What can I do for you?',
        '🕺 Help is on the way, hunny! Sou especialista em dados laboratoriais. Me diga o que precisa e vamos shake it up!',
        '👑 O Rei nunca abandona seus fãs! Estou aqui para ajudar com tudo sobre o laboratório. Burning love para resolver problemas!'
      ];
    }

    if (lowerMessage.includes('estoque') || lowerMessage.includes('inventário')) {
      return [
        '📦 That\'s my specialty, baby! Nosso estoque está rockin\' - posso mostrar relatórios, alertas e previsões. What do you need?',
        '🎸 Estoque é minha paixão, hunny! Temos controle total dos materiais. Can\'t help falling in love com essa organização!',
        '👑 O Rei do estoque está aqui! Materiais, reagentes, tudo under control. Tell me more, gorgeous!'
      ];
    }

    if (lowerMessage.includes('consulta') || lowerMessage.includes('agendamento')) {
      return [
        '📅 All shook up com os agendamentos! Posso mostrar horários, médicos disponíveis e estatísticas. What\'s on your mind?',
        '🕺 Consultas are my business, baby! Agenda lotada, mas sempre organized. Como posso ajudar?',
        '🎤 Don\'t be cruel com a agenda! Temos tudo sincronizado e ready to rock. Tell me what you need!'
      ];
    }

    if (lowerMessage.includes('relatório') || lowerMessage.includes('dados')) {
      return [
        '📊 Burning love pelos relatórios, hunny! Dados completos, gráficos beautiful e insights poderosos. What would you like to see?',
        '👑 O Rei dos dados arrived! Relatórios customizados, métricas em tempo real - tudo que seu coração desire!',
        '🎸 That\'s what I call data excellence! Posso gerar qualquer relatório que precisar, baby!'
      ];
    }

    if (lowerMessage.includes('obrigado') || lowerMessage.includes('thanks')) {
      return [
        '🕺 Thank ya, thank ya very much! Foi um prazer ajudar, hunny!',
        '👑 You\'re welcome, gorgeous! O Rei sempre à disposição!',
        '🎸 Don\'t mention it, baby! Rock and roll never stops!'
      ];
    }

    // Respostas padrão
    return [
      '🎤 That\'s interesting, hunny! Me conte mais sobre isso. O Elvinho está all ears para você!',
      '🕺 Hmm, deixa eu processar isso, baby! Como posso tornar sua experiência more rockin\'?',
      '👑 O Rei está pensando... Tell me more about that, gorgeous! Sempre burning love para aprender!',
      '🎸 Can\'t help falling in love com suas perguntas! Explique um pouco mais para eu ajudar melhor, hunny!',
      '🕺 All shook up com essa informação! Me dê mais detalhes para eu poder rock your world com a resposta!'
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