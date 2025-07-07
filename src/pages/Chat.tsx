import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Clock, Database, Plus, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Chat = () => {
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    isTyping,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { icon: Database, label: 'Ver Estoque', text: 'Quais itens estão com estoque baixo?' },
    { icon: Clock, label: 'Consultas Hoje', text: 'Quantas consultas temos hoje?' },
    { icon: Zap, label: 'Relatório Rápido', text: 'Gere um relatório geral do laboratório' },
    { icon: User, label: 'Alertas Ativos', text: 'Quais alertas temos ativos no momento?' },
    { icon: Bot, label: 'Resumo Geral', text: 'Qual o status geral do laboratório?' },
    { icon: Plus, label: 'Ajuda', text: 'Como posso usar o sistema?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [conversations, currentConversation, selectConversation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!currentConversation) {
      const newConversation = await createConversation(inputValue);
      if (!newConversation) return;
    }

    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickCommand = (text: string) => {
    setInputValue(text);
  };

  const handleNewChat = async () => {
    await createConversation();
  };

  return (
    <div className="min-h-screen ">
      <div className="p-4 md:p-6 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bot className="h-5 w-5 text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Chat com Elvinho
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Seu assistente inteligente para gestão laboratorial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Conversas
                  </h3>
                  <Button 
                    onClick={handleNewChat}
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[300px] lg:h-[500px]">
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          currentConversation?.id === conversation.id
                            ? 'bg-blue-50 dark:bg-blue-950/30'
                            : 'bg-neutral-50/80 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
                        }`}
                        onClick={() => selectConversation(conversation)}
                      >
                        <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {conversation.title}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatDistanceToNow(new Date(conversation.updated_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
                        >
                          <Trash2 className="h-3 w-3 text-red-500/80 dark:text-red-400" />
                        </Button>
                      </div>
                    ))}
                    
                    {conversations.length === 0 && (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center bg-neutral-200/50 dark:bg-neutral-800 rounded-full">
                          <MessageCircle className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                          Nenhuma conversa ainda
                        </p>
                        <Button 
                          onClick={handleNewChat} 
                          size="sm" 
                          variant="outline" 
                          className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        >
                          Iniciar Chat
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60 h-[calc(100vh-16rem)]">
              <CardContent className="p-0 h-full flex flex-col">
                {currentConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b border-neutral-200/60 dark:border-neutral-800/60 p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 dark:bg-blue-950/20 p-2 rounded-lg">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                            {currentConversation.title}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatDistanceToNow(new Date(currentConversation.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-6">
                        {messages.length === 0 && (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                              <Bot className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                              Olá! Eu sou o Elvinho, seu assistente de laboratório.
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              Como posso ajudar você hoje?
                            </p>
                          </div>
                        )}

                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 ${
                              message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className={`flex items-start gap-3 max-w-[85%] ${
                              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.sender === 'user' 
                                  ? 'bg-blue-500' 
                                  : 'bg-blue-500/20'
                              }`}>
                                {message.sender === 'user' ? (
                                  <User className="h-4 w-4 text-white" />
                                ) : (
                                  <Bot className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              
                              <div>
                                <div className={`p-3 rounded-lg ${
                                  message.sender === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <p className={`text-xs mt-1 ${
                                  message.sender === 'user'
                                    ? 'text-neutral-500 dark:text-neutral-400 text-right'
                                    : 'text-neutral-500 dark:text-neutral-400'
                                }`}>
                                  {new Date(message.created_at).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="bg-neutral-100/80 dark:bg-neutral-800/60 p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 p-4">
                      <div className="flex gap-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua mensagem sobre o laboratório..."
                          className="flex-1 bg-white dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60"
                          disabled={isTyping || loading}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!inputValue.trim() || isTyping || loading}
                          size="icon"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6">
                       <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                         <Bot className="h-8 w-8 text-blue-500" />
                       </div>
                       <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                         Bem-vindo ao Chat!
                       </h3>
                       <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                         Selecione uma conversa ou inicie um novo chat
                       </p>
                       <Button 
                         onClick={handleNewChat}
                         className="bg-blue-500 hover:bg-blue-600 text-white"
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Novo Chat
                       </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Commands & Status Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Comandos Rápidos
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickCommands.map((cmd, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickCommand(cmd.text)}
                      className="h-20 text-xs hover:bg-neutral-100/80 dark:hover:bg-neutral-800/40 transition-colors border border-neutral-200/40 dark:border-neutral-700/40 flex flex-col items-center justify-center gap-2 p-2 text-center"
                    >
                      <div className="bg-blue-500/10 dark:bg-blue-950/20 p-2 rounded-lg">
                        <cmd.icon className="h-4 w-4 text-blue-500" />
                      </div>
                      <span>{cmd.label}</span>
                    </Button>
                  ))}
                </div>
                
                 <div className="mt-4 p-3 bg-blue-50/80 dark:bg-blue-950/20 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                   <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Dica
                   </h4>
                   <p className="text-xs text-blue-600 dark:text-blue-400">
                     Clique nos comandos para inserir perguntas prontas!
                   </p>
                 </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Status do Elvinho
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-neutral-100/50 dark:bg-neutral-800/30 p-3 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40">
                    <div className="bg-blue-500/10 dark:bg-blue-950/20 p-2 rounded-lg">
                      <Bot className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        IA Perplexity • Online
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                        Pronto para ajudar!
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-100/50 dark:bg-neutral-800/30 p-3 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Modelo: sonar-deep-research
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Respostas inteligentes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;