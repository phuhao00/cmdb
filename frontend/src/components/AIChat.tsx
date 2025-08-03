'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Bot, 
  User,
  Loader2,
  Copy
} from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
import { sendChat } from '@/services/api';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
}

interface AIChatProps {
  language?: 'zh' | 'en';
}

const AIChat: React.FC<AIChatProps> = ({ language = 'zh' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 翻译函数
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: 'CMDB Assistant',
        welcomeTitle: 'Hi! How can I help you?',
        welcomeText: 'I can help you manage assets, workflows, and provide system insights.',
        placeholder: 'Ask me anything...',
        error: 'Connection error. Please try again.',
        copied: 'Copied!',
        online: 'Online',
        sending: 'Sending...',
        retry: 'Retry'
      },
      zh: {
        title: 'CMDB 助手',
        welcomeTitle: '您好！有什么可以帮助您的吗？',
        welcomeText: '我可以帮助您管理资产、工作流，并提供系统洞察。',
        placeholder: '请输入您的问题...',
        error: '连接错误，请重试。',
        copied: '已复制！',
        online: '在线',
        sending: '发送中...',
        retry: '重试'
      }
    };
    return translations[language]?.[key] || key;
  };

  // 初始欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        content: language === 'en' 
          ? 'Hello! I\'m your CMDB assistant. I can help you with asset management, workflows, and system insights. How can I assist you today?'
          : '您好！我是您的CMDB助手。我可以帮助您进行资产管理、工作流处理和系统洞察。今天有什么可以为您服务的？',
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: language === 'en' 
          ? ["View assets", "Show workflows", "System status", "Help"]
          : ["查看资产", "显示工作流", "系统状态", "帮助"]
      };
      setMessages([welcomeMessage]);
    }
  }, [language, messages.length]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // 发送消息
  const sendMessage = async (messageText: string = currentMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // 调用真实的AI API
      const response = await sendChat(messageText, language);
      
      setIsTyping(false);
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: response,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: language === 'en' 
          ? ["Tell me more", "Show examples", "Help"] 
          : ["了解更多", "显示示例", "帮助"]
      };
      setMessages(prev => [...prev, aiMessage]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    } catch (error: unknown) {
      console.error('AI API Error:', error);
      setIsTyping(false);
      
      // 如果API调用失败，显示错误信息
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: language === 'en' 
          ? `Sorry, I'm having trouble connecting to the AI service. Please try again later. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          : `抱歉，AI服务连接出现问题，请稍后重试。错误：${error instanceof Error ? error.message : '未知错误'}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: language === 'en' 
          ? ["Try again", "Help", "Contact support"] 
          : ["重试", "帮助", "联系支持"]
      };
      setMessages(prev => [...prev, errorMessage]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // TODO: 显示复制成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 浮动按钮
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </div>
        )}
      </button>
    );
  }

  // 聊天窗口
  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-300 ${
      isExpanded ? 'w-[480px] h-[720px]' : 'w-[400px] h-[600px]'
    } md:w-[400px] md:h-[600px]`}>
      {/* 头部 */}
      <div className="bg-slate-800 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{t('title')}</h3>
            <div className="flex items-center gap-2 text-sm opacity-75">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {t('online')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-700 rounded"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  message.isUser 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {!message.isUser && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="mt-2 p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* 建议按钮 */}
              {!message.isUser && message.suggestions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 正在输入指示器 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('placeholder')}
            className="flex-1 min-h-[40px] max-h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !currentMessage.trim()}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;