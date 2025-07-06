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
  message_type: 'normal';
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
  const sendMessage = async (content: string) => {
    if (!user || !currentConversation) return;

    try {
      console.log('📤 Enviando mensagem:', content);

      // Adicionar mensagem do usuário
      const userMessage = {
        conversation_id: currentConversation.id,
        content,
        sender: 'user' as const,
        message_type: 'normal' as const
      };

      const { data: userMsgData, error: userError } = await supabase
        .from('chat_messages')
        .insert(userMessage)
        .select()
        .single();

      if (userError) {
        console.error('❌ Erro ao salvar mensagem do usuário:', userError);
        throw userError;
      }

      setMessages(prev => [...prev, userMsgData as ChatMessage]);

      // Gerar resposta do Elvinho
      setIsTyping(true);
      console.log('🤖 Gerando resposta...');
      
      const elvinhoResponse = await generateElvinhoResponse(content);
      
      const elvinhoMessage = {
        conversation_id: currentConversation.id,
        content: elvinhoResponse,
        sender: 'elvinho' as const,
        message_type: 'normal' as const
      };

      const { data: elvinhoMsgData, error: elvinhoError } = await supabase
        .from('chat_messages')
        .insert(elvinhoMessage)
        .select()
        .single();

      if (elvinhoError) {
        console.error('❌ Erro ao salvar mensagem do Elvinho:', elvinhoError);
        throw elvinhoError;
      }

      setMessages(prev => [...prev, elvinhoMsgData as ChatMessage]);

      // Atualizar timestamp da conversa
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation.id);

    } catch (error) {
      console.error('💥 Erro ao enviar mensagem:', error);
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
  const generateElvinhoResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log('🔄 Chamando edge function com mensagem:', userMessage);
      
      // Preparar histórico de conversação limitado
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('perplexity-chat', {
        body: {
          message: userMessage,
          conversationHistory,
          userId: user?.id
        }
      });

      console.log('📡 Resposta da edge function:', { 
        success: !!data, 
        hasError: !!error, 
        filtered: data?.filtered,
        messageLength: data?.message?.length 
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      // Se foi filtrado por assunto não relacionado
      if (data?.filtered) {
        return data.message;
      }

      return data?.message || 'Desculpe, houve um problema técnico. Tente reformular sua pergunta.';
      
    } catch (error) {
      console.error('💥 Erro na comunicação com Elvinho:', error);
      
      return `Desculpe, estou com dificuldades técnicas no momento. 

Você pode tentar:
• Reformular sua pergunta sobre o laboratório
• Aguardar alguns segundos e tentar novamente

Como posso ajudar de outra forma?`;
    }
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