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
    <div className="min-h-screen bg-background">
      <div className="h-screen flex flex-col max-w-6xl mx-auto">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Conversas</h3>
                  <Button 
                    onClick={handleNewChat}
                    size="sm" 
                    variant="ghost"
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          currentConversation?.id === conversation.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => selectConversation(conversation)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {conversation.title}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {conversations.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Nenhuma conversa
                        </p>
                        <Button 
                          onClick={handleNewChat} 
                          size="sm" 
                          variant="outline"
                        >
                          Novo Chat
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
            <Card className="h-full flex flex-col">
              <CardContent className="p-0 h-full flex flex-col">
                {currentConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b p-3">
                      <h4 className="font-medium truncate">
                        {currentConversation.title}
                      </h4>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {messages.length === 0 && (
                          <div className="text-center py-6">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                              <Bot className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Olá! Como posso ajudar?
                            </p>
                          </div>
                        )}

                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 ${
                              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.sender === 'user' ? 'bg-primary' : 'bg-muted'
                            }`}>
                              {message.sender === 'user' ? (
                                <User className="h-3 w-3" />
                              ) : (
                                <Bot className="h-3 w-3" />
                              )}
                            </div>
                            
                            <div className={`flex-1 max-w-[85%] ${
                              message.sender === 'user' ? 'text-right' : 'text-left'
                            }`}>
                              <div className={`inline-block p-2 rounded-lg text-sm ${
                                message.sender === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                              <Bot className="h-3 w-3" />
                            </div>
                            <div className="bg-muted p-2 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="border-t p-3">
                      <div className="flex gap-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua pergunta..."
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
                       <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                         <Bot className="h-6 w-6 text-primary-foreground" />
                       </div>
                       <h3 className="text-base font-medium mb-2">
                         Chat com Elvinho
                       </h3>
                       <p className="text-sm text-muted-foreground mb-3">
                         Inicie uma nova conversa
                       </p>
                       <Button onClick={handleNewChat} size="sm">
                         <Plus className="h-4 w-4 mr-1" />
                         Novo Chat
                       </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Commands Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-3">
                <h3 className="text-sm font-medium mb-3">Perguntas Rápidas</h3>
                <div className="space-y-1">
                  {quickCommands.map((cmd, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickCommand(cmd.text)}
                      className="w-full justify-start text-xs h-7"
                    >
                      <cmd.icon className="h-3 w-3 mr-1" />
                      {cmd.label}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 p-2 bg-muted/50 rounded text-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mb-1"></div>
                  <p className="text-xs text-muted-foreground">Elvinho Online</p>
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