import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaExpand, FaCompress, FaChevronUp, FaCopy, FaRedo, FaVolumeUp, FaMinus } from 'react-icons/fa';
import { useAuth } from './AuthContext';

// 动画定义
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const typing = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
`;

// 主容器 - AWS风格
const ChatContainer = styled.div`
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: ${props => props.isExpanded ? '420px' : '380px'};
  height: ${props => props.isExpanded ? '680px' : '580px'};
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  animation: ${slideUp} 0.4s ease-out;

  @media (max-width: 768px) {
    width: calc(100vw - 32px);
    height: 75vh;
    bottom: 80px;
    right: 16px;
    left: 16px;
  }
`;

// 头部 - 简洁设计
const ChatHeader = styled.div`
  background: #232f3e;
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d26a;
  margin-left: 8px;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

// 消息容器 - 清爽背景
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }
`;

// 欢迎卡片 - AWS风格
const WelcomeCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const WelcomeIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9900, #ff7700);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const WelcomeTitle = styled.h3`
  color: #111827;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

const WelcomeText = styled.p`
  color: #6b7280;
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
`;

// 建议按钮 - 卡片式
const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
`;

const SuggestionCard = styled.button`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #ff9900;
    color: #ff9900;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 153, 0, 0.15);
  }
`;

// 消息布局
const MessageGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  animation: ${bounceIn} 0.3s ease-out;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
    : 'linear-gradient(135deg, #ff9900, #ff7700)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 14px;
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: 280px;
`;

// 消息气泡 - 现代设计
const MessageBubble = styled.div`
  background: ${props => props.isUser ? '#3b82f6' : '#ffffff'};
  color: ${props => props.isUser ? '#ffffff' : '#111827'};
  padding: 12px 16px;
  border-radius: ${props => props.isUser 
    ? '16px 16px 4px 16px' 
    : '16px 16px 16px 4px'};
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: ${props => props.isUser 
    ? '0 2px 8px rgba(59, 130, 246, 0.15)' 
    : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  border: ${props => props.isUser ? 'none' : '1px solid #e5e7eb'};

  /* 代码样式 */
  code {
    background: ${props => props.isUser ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6'};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 13px;
  }

  pre {
    background: ${props => props.isUser ? 'rgba(255, 255, 255, 0.1)' : '#f9fafb'};
    padding: 12px;
    border-radius: 6px;
    margin: 8px 0;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 13px;
    overflow-x: auto;
  }
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

// 消息操作按钮
const MessageActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};

  ${MessageGroup}:hover & {
    opacity: 1;
  }
`;

const ActionBtn = styled.button`
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

// 打字指示器
const TypingIndicator = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: ${bounceIn} 0.3s ease-out;
`;

const TypingBubble = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TypingDots = styled.div`
  display: flex;
  gap: 3px;
  
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #9ca3af;
    animation: ${typing} 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

// 输入区域
const InputArea = styled.div`
  padding: 20px 24px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 12px 12px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextInput = styled.textarea`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  max-height: 100px;
  min-height: 44px;
  background: #ffffff;
  
  &:focus {
    border-color: #ff9900;
    box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  background: #ff9900;
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #e88500;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// 浮动按钮
const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: #232f3e;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(35, 47, 62, 0.25);
  transition: all 0.3s ease;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 12px 32px rgba(35, 47, 62, 0.35);
    background: #1a252f;
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid white;
`;

const AIChat = ({ language = 'zh' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  // 翻译函数
  const t = (key) => {
    const translations = {
      en: {
        title: 'CMDB Assistant',
        welcomeTitle: 'Hi! How can I help you?',
        welcomeText: 'I can help you manage assets, workflows, and provide system insights.',
        placeholder: 'Ask me anything...',
        error: 'Connection error. Please try again.',
        suggestions: ["View assets", "My workflows", "System stats", "Help"],
        copied: 'Copied!',
        online: 'Online'
      },
      zh: {
        title: 'CMDB 助手',
        welcomeTitle: '您好！我能为您做些什么？',
        welcomeText: '我可以帮助您管理资产、工作流程，并提供系统洞察。',
        placeholder: '请输入您的问题...',
        error: '连接错误，请重试。',
        suggestions: ["查看资产", "我的工作流", "系统统计", "帮助"],
        copied: '已复制！',
        online: '在线'
      }
    };
    return translations[language][key] || translations['zh'][key];
  };

  // 自动调整输入框高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = '44px';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
  }, []);

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return language === 'en' ? 'Just now' : '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}${language === 'en' ? 'm' : '分钟'}`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 功能函数
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const resendMessage = (content) => {
    sendMessage(content);
  };

  const speakMessage = (content) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = language === 'en' ? 'en-US' : 'zh-CN';
      speechSynthesis.speak(utterance);
    }
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

  useEffect(() => {
    adjustTextareaHeight();
  }, [currentMessage, adjustTextareaHeight]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText = currentMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // 模拟AI响应
    setTimeout(() => {
      setIsTyping(false);
      const aiMessage = {
        id: Date.now() + 1,
        content: `我收到了您的消息："${messageText}"。这是一个模拟回复，实际使用时会连接到真实的AI服务。`,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: language === 'en' 
          ? ["Tell me more", "Show examples", "Help"] 
          : ["了解更多", "显示示例", "帮助"]
      };
      setMessages(prev => [...prev, aiMessage]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen) {
    return (
      <FloatingButton onClick={toggleChat}>
        <FaRobot size={20} />
        {unreadCount > 0 && (
          <NotificationBadge>{unreadCount}</NotificationBadge>
        )}
      </FloatingButton>
    );
  }

  return (
    <>
      <ChatContainer isExpanded={isExpanded}>
        <ChatHeader>
          <HeaderTitle>
            <FaRobot size={18} />
            {t('title')}
            <StatusDot />
          </HeaderTitle>
          <HeaderActions>
            <HeaderButton onClick={toggleExpand}>
              {isExpanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </HeaderButton>
            <HeaderButton onClick={toggleChat}>
              <FaTimes size={14} />
            </HeaderButton>
          </HeaderActions>
        </ChatHeader>

        <MessagesContainer>
          {messages.length === 0 && (
            <WelcomeCard>
              <WelcomeIcon>
                <FaRobot size={20} />
              </WelcomeIcon>
              <WelcomeTitle>{t('welcomeTitle')}</WelcomeTitle>
              <WelcomeText>{t('welcomeText')}</WelcomeText>
              <SuggestionsGrid>
                {t('suggestions').map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionCard>
                ))}
              </SuggestionsGrid>
            </WelcomeCard>
          )}

          {messages.map((message) => (
            <MessageGroup key={message.id} isUser={message.isUser}>
              <Avatar isUser={message.isUser}>
                {message.isUser ? <FaUser size={14} /> : <FaRobot size={14} />}
              </Avatar>
              <MessageContent>
                <MessageBubble isUser={message.isUser}>
                  {message.content}
                </MessageBubble>
                <MessageTime isUser={message.isUser}>
                  {formatTime(message.timestamp)}
                </MessageTime>
                <MessageActions isUser={message.isUser}>
                  <ActionBtn onClick={() => copyMessage(message.content)}>
                    <FaCopy size={10} />
                  </ActionBtn>
                  {!message.isUser && (
                    <ActionBtn onClick={() => speakMessage(message.content)}>
                      <FaVolumeUp size={10} />
                    </ActionBtn>
                  )}
                  {message.isUser && (
                    <ActionBtn onClick={() => resendMessage(message.content)}>
                      <FaRedo size={10} />
                    </ActionBtn>
                  )}
                </MessageActions>
                {message.suggestions && (
                  <SuggestionsGrid style={{ marginTop: '8px' }}>
                    {message.suggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </SuggestionCard>
                    ))}
                  </SuggestionsGrid>
                )}
              </MessageContent>
            </MessageGroup>
          ))}

          {isTyping && (
            <TypingIndicator>
              <Avatar isUser={false}>
                <FaRobot size={14} />
              </Avatar>
              <TypingBubble>
                <TypingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingDots>
              </TypingBubble>
            </TypingIndicator>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputArea>
          <InputContainer>
            <InputWrapper>
              <TextInput
                ref={inputRef}
                value={currentMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={t('placeholder')}
                disabled={isLoading}
                rows={1}
              />
            </InputWrapper>
            <SendButton 
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading}
            >
              <FaPaperPlane size={16} />
            </SendButton>
          </InputContainer>
        </InputArea>
      </ChatContainer>
      
      <FloatingButton onClick={toggleChat}>
        <FaMinus size={16} />
      </FloatingButton>
    </>
  );
};

export default AIChat; 