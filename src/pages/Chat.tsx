import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Clock, Database, Plus, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    { icon: Database, label: 'Ver Estoque', command: '/estoque' },
    { icon: Clock, label: 'Consultas Hoje', command: '/consultas-hoje' },
    { icon: Zap, label: 'Relatório Rápido', command: '/relatorio' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Se não há conversa selecionada e existem conversas, selecionar a primeira
  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [conversations, currentConversation, selectConversation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Se não há conversa atual, criar uma nova
    if (!currentConversation) {
      const newConversation = await createConversation(inputValue);
      if (!newConversation) return;
    }

    const messageType = inputValue.startsWith('/') ? 'command' : 'normal';
    await sendMessage(inputValue, messageType);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickCommand = (command: string) => {
    setInputValue(command);
  };

  const handleNewChat = async () => {
    await createConversation();
  };

  return (
    <div className="min-h-screen">
      <div className="p-2 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Bot className="h-5 w-5 text-blue-500" />
            </div>
            Chat com Elvinho
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Seu assistente inteligente para gestão laboratorial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Conversas
                  </h3>
                  <Button 
                    onClick={handleNewChat}
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 p-0"
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
                            ? 'bg-blue-50 dark:bg-blue-950/20'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                        }`}
                        onClick={() => selectConversation(conversation)}
                      >
                        <MessageCircle className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {conversation.title}
                          </p>
                          <p className="text-xs text-neutral-500">
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
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    {conversations.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-sm text-neutral-500">
                          Nenhuma conversa ainda
                        </p>
                        <Button 
                          onClick={handleNewChat} 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
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
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60 h-[calc(100vh-16rem)]">
              <CardContent className="p-0 h-full flex flex-col">
                {currentConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b border-neutral-200 dark:border-neutral-700 p-4">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {currentConversation.title}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Conversa com Elvinho • {formatDistanceToNow(new Date(currentConversation.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                              <Bot className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                              Olá! Eu sou o Elvinho, seu assistente de laboratório.
                            </p>
                            <p className="text-sm text-neutral-500">
                              Como posso ajudar você hoje?
                            </p>
                          </div>
                        )}

                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 ${
                              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.sender === 'user' 
                                 ? 'bg-blue-500' 
                                 : 'bg-blue-500'
                            }`}>
                              {message.sender === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            
                            <div className={`flex-1 max-w-[80%] ${
                              message.sender === 'user' ? 'text-right' : 'text-left'
                            }`}>
                              <div className={`inline-block p-3 rounded-lg ${
                                message.sender === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                {message.message_type === 'command' && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    Comando
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">
                                {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
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
                    <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
                      <div className="flex gap-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua mensagem ou use comandos como /estoque..."
                          className="flex-1"
                          disabled={isTyping || loading}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!inputValue.trim() || isTyping || loading}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                       <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                         <Bot className="h-8 w-8 text-white" />
                       </div>
                       <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                         Bem-vindo ao Chat!
                       </h3>
                       <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                         Selecione uma conversa ou inicie um novo chat
                       </p>
                       <Button onClick={handleNewChat}>
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
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                  Comandos Rápidos
                </h3>
                <div className="space-y-2">
                  {quickCommands.map((cmd, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickCommand(cmd.command)}
                      className="w-full justify-start text-xs h-8 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <cmd.icon className="h-3 w-3 mr-2" />
                      {cmd.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                  Status do Elvinho
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Online • IA Perplexity
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Modelo: llama-3.1-sonar
                  </div>
                  <div className="text-xs text-neutral-500">
                    Respostas inteligentes
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Pronto para ajudar!
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