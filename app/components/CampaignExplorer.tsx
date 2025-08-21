import React, { useState, useRef, useCallback } from 'react';
import './CampaignExplorer.css';

interface CampaignExplorerProps {
  campaignId: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const CampaignExplorer: React.FC<CampaignExplorerProps> = ({ campaignId }) => {
  const [ideaPaneWidthPercent, setIdeaPaneWidthPercent] = useState(60);
  const [topPanesHeightPercent, setTopPanesHeightPercent] = useState(70);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your campaign assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleVerticalResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const startY = e.clientY;
    const startHeightPercent = topPanesHeightPercent;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const deltaPercent = (deltaY / containerRect.height) * 100;
      const newHeightPercent = Math.max(20, Math.min(80, startHeightPercent + deltaPercent));
      setTopPanesHeightPercent(newHeightPercent);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [topPanesHeightPercent]);

  const handleHorizontalResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const startX = e.clientX;
    const startWidthPercent = ideaPaneWidthPercent;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerRect.width) * 100;
      const newWidthPercent = Math.max(20, Math.min(80, startWidthPercent + deltaPercent));
      setIdeaPaneWidthPercent(newWidthPercent);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [ideaPaneWidthPercent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateBotResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting point. Let me help you with that.",
      "I understand your question. Here's what I think...",
      "Great question! Based on your campaign, I'd suggest...",
      "Let me analyze that for you. Here are some ideas:",
      "I can help you with that. Have you considered...",
      "That's a good approach. You might also want to think about..."
    ];
    
    if (userMessage.toLowerCase().includes('help')) {
      return "I'm here to help! I can assist with campaign strategy, content ideas, audience targeting, and performance analysis. What would you like to explore?";
    }
    
    if (userMessage.toLowerCase().includes('idea')) {
      return "Here are some creative ideas for your campaign: 1) Interactive content that engages your audience, 2) User-generated content campaigns, 3) Behind-the-scenes storytelling. Which direction interests you most?";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: simulateBotResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }, 1000 + Math.random() * 2000);

    setTimeout(scrollToBottom, 100);
  }, [inputMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="campaign-explorer-layout">
      {/* Top Row - Ideas and Details */}
      <div 
        className="top-row" 
        style={{ height: `${topPanesHeightPercent}%` }}
      >
        {/* Idea View - Top Left */}
        <div 
          className="idea-view"
          style={{ width: `${ideaPaneWidthPercent}%` }}
        >
          <div className="pane-header">
            <h3>Ideas</h3>
          </div>
          <div className="pane-content">
            {/* Empty for now */}
          </div>
        </div>

        {/* Vertical Resize Handle */}
        <div 
          className="resize-handle resize-handle-vertical"
          onMouseDown={handleHorizontalResize}
        />

        {/* Details Pane - Top Right */}
        <div 
          className="details-pane"
          style={{ width: `${100 - ideaPaneWidthPercent}%` }}
        >
          <div className="pane-header">
            <h3>Details</h3>
          </div>
          <div className="pane-content">
            {/* Empty for now */}
          </div>
        </div>
      </div>

      {/* Horizontal Resize Handle */}
      <div 
        className="resize-handle resize-handle-horizontal"
        onMouseDown={handleVerticalResize}
      />

      {/* Chat Box - Bottom */}
      <div 
        className="chat-box"
        style={{ height: `${100 - topPanesHeightPercent}%` }}
      >
        <div className="pane-header">
          <h3>Chat Assistant</h3>
        </div>
        <div className="chat-content">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message message-bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="message-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="send-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignExplorer;
