import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaRobot, FaUser, FaLightbulb, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${props => props.isExpanded ? '400px' : '350px'};
  height: ${props => props.isExpanded ? '600px' : '500px'};
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: ${props => props.isExpanded ? '80vh' : '70vh'};
    bottom: 10px;
    right: 10px;
    left: 10px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  ${props => props.isUser && 'flex-direction: row-reverse;'}
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isUser ? '#667eea' : '#f0f0f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.isUser ? 'white' : '#666'};
  flex-shrink: 0;
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser ? '#667eea' : '#f8f9fa'};
  color: ${props => props.isUser ? 'white' : '#333'};
  padding: 0.8rem 1rem;
  border-radius: 16px;
  max-width: 80%;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;

  ${props => props.isUser && `
    border-bottom-right-radius: 4px;
  `}

  ${props => !props.isUser && `
    border-bottom-left-radius: 4px;
  `}
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SuggestionChip = styled.button`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 0.5rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 24px;
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #667eea;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: #667eea;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #5a6fd8;
    transform: scale(1.05);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
  }
`;

const LoadingDots = styled.div`
  display: inline-block;
  
  &::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #667eea;
    animation: loading 1.4s infinite ease-in-out;
  }

  @keyframes loading {
    0%, 80%, 100% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
  }
`;

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "🤖 您好！我是CMDB智能助手，可以帮助您查询资产信息、工作流状态等。\n\n试试问我：\n• 查看所有资产\n• 我的工作流\n• 系统统计\n• 帮助",
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: ["查看所有资产", "我的工作流", "系统统计", "帮助"]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const messagesEndRef = useRef(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/ai/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (message = currentMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          content: data.message,
          isUser: false,
          timestamp: data.timestamp,
          suggestions: data.suggestions || [],
          data: data.data
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          content: "抱歉，我暂时无法回应。请稍后再试。",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: "连接出现问题，请检查网络连接后重试。",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      </ToggleButton>
    );
  }

  return (
    <>
      <ChatContainer isExpanded={isExpanded}>
        <ChatHeader>
          <HeaderTitle>
            <FaRobot />
            CMDB AI助手
          </HeaderTitle>
          <HeaderActions>
            <HeaderButton onClick={toggleExpand}>
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </HeaderButton>
            <HeaderButton onClick={toggleChat}>
              <FaTimes />
            </HeaderButton>
          </HeaderActions>
        </ChatHeader>

        <MessagesContainer>
          {messages.map((message) => (
            <Message key={message.id} isUser={message.isUser}>
              <MessageAvatar isUser={message.isUser}>
                {message.isUser ? <FaUser size={16} /> : <FaRobot size={16} />}
              </MessageAvatar>
              <div>
                <MessageBubble isUser={message.isUser}>
                  {message.content}
                </MessageBubble>
                {message.suggestions && message.suggestions.length > 0 && (
                  <SuggestionsContainer>
                    {message.suggestions.map((suggestion, index) => (
                      <SuggestionChip
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <FaLightbulb size={12} style={{ marginRight: '4px' }} />
                        {suggestion}
                      </SuggestionChip>
                    ))}
                  </SuggestionsContainer>
                )}
              </div>
            </Message>
          ))}
          {isLoading && (
            <Message isUser={false}>
              <MessageAvatar isUser={false}>
                <FaRobot size={16} />
              </MessageAvatar>
              <MessageBubble isUser={false}>
                正在思考中 <LoadingDots />
              </MessageBubble>
            </Message>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <MessageInput
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            disabled={isLoading}
          />
          <SendButton onClick={() => sendMessage()} disabled={isLoading || !currentMessage.trim()}>
            <FaPaperPlane size={16} />
          </SendButton>
        </InputContainer>
      </ChatContainer>
    </>
  );
};

export default AIChat; 