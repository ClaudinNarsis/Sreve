import React, { useState, useRef, useCallback, useEffect } from 'react';
import './CampaignExplorer.css';

interface CampaignExplorerProps {
  campaignId: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  apiResponse?: any;
}

interface ApiResponse {
  chat: {
    thinking: string;
    clarifying_questions: string[];
    topic: string;
  };
  detials: {
    format: string;
    critic: {
      attention: { score: number; reason: string; };
      trend_fit: { score: number; reason: string; };
      originality: { score: number; reason: string; };
      brand_fit: { score: number; reason: string; };
      overall: number;
      improvements: string[];
    };
  };
  ideas: {
    ideas: Array<{ angle: string; hook: string; description: string; }>;
    examples: any[];
    trends: Array<{ title: string; url: string; snippet: string; hooks: string[]; hashtags: string[]; audios: any[]; }>;
    selection: {
      selected: {
        angle: string;
        hook: string;
        description: string;
        scores: { [key: string]: number };
        rationale: string;
      };
      rejected: Array<{ idea: any; reason: string; }>;
    };
    deliverable: {
      title: string;
      hook: string;
      visual_concepts: string[];
      copy_variants: string[];
      platform_tips: string[];
    };
  };
}

const CampaignExplorer: React.FC<CampaignExplorerProps> = ({ campaignId }) => {
  console.log('🔧 CampaignExplorer rendered with campaignId:', campaignId);
  
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
  const [currentApiResponse, setCurrentApiResponse] = useState<ApiResponse | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
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

  const fetchChatMessages = useCallback(async (campaignId: string) => {
    console.log('📥 Fetching chat messages for campaign:', campaignId);
    setLoadingMessages(true);
    
    try {
      const response = await fetch(`/api/chat?campaignId=${campaignId}`);
      const data = await response.json();
      
      console.log('📋 Chat messages API response:', data);
      
      if (response.ok && data.success) {
        const dbMessages = data.messages || [];
        console.log('✅ Loaded messages from DB:', dbMessages.length);
        
        // Convert DB messages to ChatMessage format
        const convertedMessages: ChatMessage[] = dbMessages.map((dbMsg: any) => ({
          id: dbMsg.chatMessageId,
          text: dbMsg.message,
          sender: dbMsg.sender as 'user' | 'bot',
          timestamp: new Date(dbMsg.timestamp || dbMsg.createdAt),
          apiResponse: dbMsg.apiResponse
        }));
        
        // Set the most recent API response if available
        const lastBotMessage = convertedMessages
          .filter(msg => msg.sender === 'bot' && msg.apiResponse)
          .pop();
          
        if (lastBotMessage?.apiResponse?.result) {
          console.log('🎯 Setting current API response from last bot message');
          setCurrentApiResponse(lastBotMessage.apiResponse.result);
        }
        
        // Set messages (replacing the default welcome message)
        setMessages(convertedMessages.length > 0 ? convertedMessages : [
          {
            id: '1',
            text: 'Hello! I\'m your campaign assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
        
        setTimeout(scrollToBottom, 100);
      } else {
        console.error('❌ Failed to load chat messages:', data.error);
        // Keep default welcome message on error
        setMessages([
          {
            id: '1',
            text: 'Hello! I\'m your campaign assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching chat messages:', error);
      // Keep default welcome message on error
      setMessages([
        {
          id: '1',
          text: 'Hello! I\'m your campaign assistant. How can I help you today?',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load chat messages when campaign changes
  useEffect(() => {
    console.log('🔄 Campaign ID changed:', campaignId);
    
    if (campaignId) {
      fetchChatMessages(campaignId);
    } else {
      console.log('🔄 No campaign selected, showing default message');
      // Reset to default state when no campaign is selected
      setMessages([
        {
          id: '1',
          text: 'Hello! I\'m your campaign assistant. How can I help you today?',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
      setCurrentApiResponse(null);
    }
  }, [campaignId, fetchChatMessages]);

  const handleSendMessage = useCallback(async () => {
    console.log('🚀 handleSendMessage called');
    console.log('📝 inputMessage:', inputMessage);
    console.log('🏷️ campaignId:', campaignId);
    
    if (!inputMessage.trim()) {
      console.log('❌ Empty input message, returning');
      return;
    }
    
    if (!campaignId) {
      console.log('❌ No campaign ID, returning');
      return;
    }

    console.log('✅ Validation passed, creating user message');
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    console.log('📨 User message created:', userMessage);
    
    setMessages(prev => {
      console.log('📝 Adding user message to chat');
      return [...prev, userMessage];
    });
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('📡 Making API call to /api/generate');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignId,
          userMessage: userMessage.text
        }),
      });

      console.log('📡 API response status:', response.status);
      console.log('📡 API response ok:', response.ok);
      
      const data = await response.json();
      console.log('📋 API response data:', data);

      if (response.ok && data.success) {
        const apiResponse = data.apiResponse;
        
        // Update the current API response for the panes
        if (apiResponse?.result) {
          setCurrentApiResponse(apiResponse.result);
        }

        const botResponse: ChatMessage = {
          id: data.botMessageId,
          text: apiResponse?.result?.chat?.thinking || 'I\'ve analyzed your request and generated ideas for you.',
          sender: 'bot',
          timestamp: new Date(),
          apiResponse: apiResponse
        };

        setMessages(prev => [...prev, botResponse]);
        
        // Show clarifying questions if any
        if (apiResponse?.result?.chat?.clarifying_questions?.length > 0) {
          setTimeout(() => {
            const clarifyingMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              text: `I have some clarifying questions: ${apiResponse.result.chat.clarifying_questions.join('; ')}`,
              sender: 'bot',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, clarifyingMessage]);
            setTimeout(scrollToBottom, 100);
          }, 1000);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [inputMessage, campaignId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', e.key);
    console.log('⌨️ Shift key:', e.shiftKey);
    
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('✅ Enter key without shift - calling handleSendMessage');
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
            {currentApiResponse?.ideas ? (
              <div className="ideas-content">
                <div className="section">
                  <h4>Generated Ideas</h4>
                  {currentApiResponse.ideas.ideas.map((idea, index) => (
                    <div key={index} className="idea-card">
                      <div className="idea-angle">{idea.angle}</div>
                      <div className="idea-hook">"{idea.hook}"</div>
                      <div className="idea-description">{idea.description}</div>
                    </div>
                  ))}
                </div>
                
                {currentApiResponse.ideas.selection?.selected && (
                  <div className="section">
                    <h4>Selected Idea</h4>
                    <div className="selected-idea">
                      <div className="idea-angle">{currentApiResponse.ideas.selection.selected.angle}</div>
                      <div className="idea-hook">"{currentApiResponse.ideas.selection.selected.hook}"</div>
                      <div className="idea-description">{currentApiResponse.ideas.selection.selected.description}</div>
                      <div className="rationale">{currentApiResponse.ideas.selection.selected.rationale}</div>
                      <div className="scores">
                        {Object.entries(currentApiResponse.ideas.selection.selected.scores || {}).map(([key, score]) => (
                          <span key={key} className="score-badge">{key}: {score}/10</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentApiResponse.ideas.deliverable && (
                  <div className="section">
                    <h4>Deliverable</h4>
                    <div className="deliverable">
                      <div className="deliverable-title">{currentApiResponse.ideas.deliverable.title}</div>
                      <div className="deliverable-hook">Hook: "{currentApiResponse.ideas.deliverable.hook}"</div>
                      
                      <div className="subsection">
                        <h5>Visual Concepts</h5>
                        <ul>
                          {currentApiResponse.ideas.deliverable.visual_concepts?.map((concept, index) => (
                            <li key={index}>{concept}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="subsection">
                        <h5>Copy Variants</h5>
                        <ul>
                          {currentApiResponse.ideas.deliverable.copy_variants?.map((copy, index) => (
                            <li key={index}>"{copy}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-content">Ideas will appear here after you send a message</div>
            )}
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
            {currentApiResponse?.detials ? (
              <div className="details-content">
                <div className="section">
                  <h4>Format</h4>
                  <div className="format-info">{currentApiResponse.detials.format}</div>
                </div>

                {currentApiResponse.detials.critic && (
                  <div className="section">
                    <h4>Analysis & Critique</h4>
                    <div className="critic-scores">
                      <div className="score-item">
                        <span className="score-label">Attention:</span>
                        <span className="score-value">{currentApiResponse.detials.critic.attention?.score}/10</span>
                        <div className="score-reason">{currentApiResponse.detials.critic.attention?.reason}</div>
                      </div>
                      
                      <div className="score-item">
                        <span className="score-label">Trend Fit:</span>
                        <span className="score-value">{currentApiResponse.detials.critic.trend_fit?.score}/10</span>
                        <div className="score-reason">{currentApiResponse.detials.critic.trend_fit?.reason}</div>
                      </div>
                      
                      <div className="score-item">
                        <span className="score-label">Originality:</span>
                        <span className="score-value">{currentApiResponse.detials.critic.originality?.score}/10</span>
                        <div className="score-reason">{currentApiResponse.detials.critic.originality?.reason}</div>
                      </div>
                      
                      <div className="score-item">
                        <span className="score-label">Brand Fit:</span>
                        <span className="score-value">{currentApiResponse.detials.critic.brand_fit?.score}/10</span>
                        <div className="score-reason">{currentApiResponse.detials.critic.brand_fit?.reason}</div>
                      </div>
                      
                      <div className="overall-score">
                        <span className="score-label">Overall Score:</span>
                        <span className="score-value">{currentApiResponse.detials.critic.overall}/10</span>
                      </div>
                    </div>
                    
                    {currentApiResponse.detials.critic.improvements?.length > 0 && (
                      <div className="improvements">
                        <h5>Suggested Improvements</h5>
                        <ul>
                          {currentApiResponse.detials.critic.improvements.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {currentApiResponse?.ideas?.trends?.length > 0 && (
                  <div className="section">
                    <h4>Trends</h4>
                    {currentApiResponse.ideas.trends.map((trend, index) => (
                      <div key={index} className="trend-item">
                        <div className="trend-title">{trend.title}</div>
                        <div className="trend-snippet">{trend.snippet}</div>
                        {trend.url && <a href={trend.url} target="_blank" rel="noopener noreferrer" className="trend-link">View Source</a>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-content">Analysis details will appear here after you send a message</div>
            )}
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
            {loadingMessages && (
              <div className="loading-messages">
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="loading-text">Loading chat history...</span>
              </div>
            )}
            {!loadingMessages && messages.map((message) => (
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
                onChange={(e) => {
                  console.log('📝 Input changed:', e.target.value);
                  setInputMessage(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="message-input"
              />
              <button
                onClick={() => {
                  console.log('🖱️ Send button clicked');
                  console.log('🖱️ Button disabled:', !inputMessage.trim() || isTyping);
                  console.log('🖱️ Input message:', inputMessage);
                  console.log('🖱️ Is typing:', isTyping);
                  handleSendMessage();
                }}
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
