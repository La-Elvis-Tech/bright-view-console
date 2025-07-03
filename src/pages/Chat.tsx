import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Clock, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'elvinho';
  timestamp: Date;
  type?: 'command' | 'normal';
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Eu sou o Elvinho, seu assistente inteligente de laboratório. Como posso ajudar você hoje?',
      sender: 'elvinho',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  const simulateElvinhoResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simular delay de resposta
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    const isCommand = userMessage.startsWith('/');
    
    if (isCommand) {
      switch (userMessage.toLowerCase()) {
        case '/estoque':
          response = 'Consultando estoque atual... Encontrei 45 itens com estoque baixo e 3 itens próximos ao vencimento. Deseja ver detalhes?';
          break;
        case '/consultas-hoje':
          response = 'Hoje temos 23 consultas agendadas, 18 já realizadas e 5 pendentes. A taxa de ocupação está em 85%.';
          break;
        case '/relatorio':
          response = 'Gerando relatório... Esta semana processamos 147 exames, com crescimento de 12% em relação à semana anterior.';
          break;
        default:
          response = 'Comando não reconhecido. Comandos disponíveis: /estoque, /consultas-hoje, /relatorio';
      }
    } else {
      response = `Entendi sua pergunta sobre "${userMessage}". Estou processando os dados do laboratório para fornecer a melhor resposta. Como posso ser mais específico?`;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: response,
      sender: 'elvinho',
      timestamp: new Date(),
      type: isCommand ? 'command' : 'normal'
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: inputValue.startsWith('/') ? 'command' : 'normal'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputValue;
    setInputValue('');

    await simulateElvinhoResponse(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickCommand = (command: string) => {
    setInputValue(command);
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="xl:col-span-3">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60 h-[calc(100vh-16rem)]">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
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
                          <p className="text-sm">{message.content}</p>
                          {message.type === 'command' && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Comando
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
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

                {/* Input Area */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem ou use comandos como /estoque..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputValue.trim() || isTyping}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Commands Sidebar */}
          <div className="space-y-4">
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
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Online
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Tempo de resposta: ~1.5s
                  </div>
                  <div className="text-xs text-neutral-500">
                    Última atualização: Agora
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