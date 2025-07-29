import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaExpand, FaCompress, FaChevronUp, FaCopy, FaRedo, FaVolumeUp } from 'react-icons/fa';
import { useAuth } from './AuthContext';

// 动画定义
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 153, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 153, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 153, 0, 0);
  }
`;

const typing = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const ChatContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: ${props => props.isExpanded ? '450px' : '400px'};
  height: ${props => props.isExpanded ? '700px' : '620px'};
  background: white;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15), 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    width: calc(100vw - 32px);
    height: ${props => props.isExpanded ? '85vh' : '75vh'};
    bottom: 80px;
    right: 16px;
    left: 16px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #232F3E 0%, #FF9900 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px 20px 0 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  margin-left: 8px;
  animation: ${pulse} 2s infinite;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: linear-gradient(180deg, #fafbfc 0%, #f8f9fa 100%);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #e1e5e9, #c1c7cd);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #c1c7cd, #a1a7ad);
  }
`;

const Message = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  animation: ${bounceIn} 0.4s ease-out;
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'linear-gradient(135deg, #232F3E 0%, #FF9900 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: 320px;
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  color: ${props => props.isUser ? 'white' : '#2c3e50'};
  padding: 18px 22px;
  border-radius: ${props => props.isUser 
    ? '22px 22px 6px 22px' 
    : '22px 22px 22px 6px'};
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 14px;
  box-shadow: ${props => props.isUser 
    ? '0 4px 16px rgba(102, 126, 234, 0.3)' 
    : '0 4px 16px rgba(0, 0, 0, 0.08)'};
  white-space: pre-wrap;
  position: relative;
  border: ${props => props.isUser ? 'none' : '1px solid rgba(0, 0, 0, 0.06)'};

  /* 代码块样式 */
  pre {
    background: ${props => props.isUser ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa'};
    padding: 12px;
    border-radius: 8px;
    margin: 8px 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    overflow-x: auto;
  }

  /* 列表样式 */
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: #adb5bd;
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const MessageActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${Message}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(108, 117, 125, 0.1);
  border: none;
  color: #6c757d;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(108, 117, 125, 0.2);
    color: #495057;
  }
`;

const WelcomeMessage = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  text-align: center;
  animation: ${slideUp} 0.6s ease-out;
`;

const WelcomeTitle = styled.h3`
  color: #232F3E;
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
`;

const WelcomeText = styled.p`
  color: #5a6c7d;
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  justify-content: center;
`;

const SuggestionChip = styled.button`
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 1px solid #e1e5e9;
  color: #495057;
  padding: 10px 18px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  animation: ${bounceIn} 0.4s ease-out;
`;

const TypingBubble = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 18px 22px;
  border-radius: 22px 22px 22px 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: ${typing} 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const InputContainer = styled.div`
  padding: 24px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 0 0 20px 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const TextInput = styled.textarea`
  flex: 1;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
  max-height: 120px;
  min-height: 48px;
  background: linear-gradient(135deg, #fff 0%, #fafbfc 100%);
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: white;
  }
  
  &::placeholder {
    color: #adb5bd;
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #232F3E 0%, #FF9900 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(35, 47, 62, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1) translateY(-3px);
    box-shadow: 0 16px 48px rgba(35, 47, 62, 0.4);
  }

  &:active {
    transform: scale(1.05) translateY(-1px);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 56px;
    height: 56px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4757;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  animation: ${pulse} 2s infinite;
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
        title: 'CMDB AI Assistant',
        welcomeTitle: 'Hi! I\'m your CMDB Assistant',
        welcomeText: 'I can help you manage assets, workflows, and provide system insights. What would you like to know?',
        placeholder: 'Type your message...',
        error: 'Connection error. Please try again.',
        suggestions: ["View all assets", "My workflows", "System statistics", "Help & commands"],
        copied: 'Copied!',
        online: 'Online'
      },
      zh: {
        title: 'CMDB AI助手',
        welcomeTitle: '您好！我是您的CMDB助手',
        welcomeText: '我可以帮助您管理资产、工作流程，并提供系统洞察。您想了解什么？',
        placeholder: '输入您的消息...',
        error: '连接错误，请重试。',
        suggestions: ["查看所有资产", "我的工作流", "系统统计", "帮助和命令"],
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
      textarea.style.height = '48px';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return language === 'en' ? 'Just now' : '刚刚';
    if (diffInMinutes < 60) return language === 'en' ? `${diffInMinutes}m ago` : `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return language === 'en' ? `${Math.floor(diffInMinutes / 60)}h ago` : `${Math.floor(diffInMinutes / 60)}小时前`;
    return date.toLocaleDateString();
  };

  // 复制消息内容
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      // 可以添加提示
    });
  };

  // 重新发送消息
  const resendMessage = (content) => {
    sendMessage(content);
  };

  // 朗读消息
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

    // 模拟打字效果延迟
    setTimeout(() => setIsTyping(false), 1000 + Math.random() * 2000);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageText, language }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          content: data.response || '抱歉，我现在无法回答这个问题。',
          isUser: false,
          timestamp: new Date().toISOString(),
          suggestions: data.suggestions
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          if (!isOpen) setUnreadCount(prev => prev + 1);
        }, 1000);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: t('error'),
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
      }, 1000);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsTyping(false);
      }, 1000);
    }
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
      <ToggleButton onClick={toggleChat}>
        <FaRobot size={24} />
        {unreadCount > 0 && (
          <NotificationBadge>{unreadCount}</NotificationBadge>
        )}
      </ToggleButton>
    );
  }

  return (
    <>
      <ChatContainer isExpanded={isExpanded}>
        <ChatHeader>
          <HeaderTitle>
            <FaRobot size={22} />
            {t('title')}
            <StatusIndicator />
          </HeaderTitle>
          <HeaderActions>
            <HeaderButton onClick={toggleExpand} title={isExpanded ? 'Minimize' : 'Expand'}>
              {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </HeaderButton>
            <HeaderButton onClick={toggleChat} title="Close">
              <FaTimes size={16} />
            </HeaderButton>
          </HeaderActions>
        </ChatHeader>

        <MessagesContainer>
          {messages.length === 0 && (
            <WelcomeMessage>
              <WelcomeTitle>{t('welcomeTitle')}</WelcomeTitle>
              <WelcomeText>{t('welcomeText')}</WelcomeText>
              <SuggestionsContainer>
                {t('suggestions').map((suggestion, index) => (
                  <SuggestionChip
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionChip>
                ))}
              </SuggestionsContainer>
            </WelcomeMessage>
          )}

          {messages.map((message) => (
            <Message key={message.id} isUser={message.isUser}>
              <MessageAvatar isUser={message.isUser}>
                {message.isUser ? <FaUser size={18} /> : <FaRobot size={18} />}
              </MessageAvatar>
              <MessageContent>
                <MessageBubble isUser={message.isUser}>
                  {message.content}
                </MessageBubble>
                <MessageTime isUser={message.isUser}>
                  {formatTime(message.timestamp)}
                </MessageTime>
                <MessageActions isUser={message.isUser}>
                  <ActionButton 
                    onClick={() => copyMessage(message.content)}
                    title={t('copied')}
                  >
                    <FaCopy size={12} />
                  </ActionButton>
                  {!message.isUser && (
                    <ActionButton 
                      onClick={() => speakMessage(message.content)}
                      title="Read aloud"
                    >
                      <FaVolumeUp size={12} />
                    </ActionButton>
                  )}
                  {message.isUser && (
                    <ActionButton 
                      onClick={() => resendMessage(message.content)}
                      title="Resend"
                    >
                      <FaRedo size={12} />
                    </ActionButton>
                  )}
                </MessageActions>
                {message.suggestions && message.suggestions.length > 0 && (
                  <SuggestionsContainer style={{ marginTop: '12px', justifyContent: message.isUser ? 'flex-end' : 'flex-start' }}>
                    {message.suggestions.map((suggestion, index) => (
                      <SuggestionChip
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </SuggestionChip>
                    ))}
                  </SuggestionsContainer>
                )}
              </MessageContent>
            </Message>
          ))}

          {isTyping && (
            <TypingIndicator>
              <MessageAvatar isUser={false}>
                <FaRobot size={18} />
              </MessageAvatar>
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
            <SendButton 
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading}
              title="Send message"
            >
              <FaPaperPlane size={18} />
            </SendButton>
          </InputWrapper>
        </InputContainer>
      </ChatContainer>
      
      <ToggleButton onClick={toggleChat}>
        <FaChevronUp size={24} />
      </ToggleButton>
    </>
  );
};

export default AIChat; 