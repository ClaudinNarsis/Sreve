import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import './CampaignExplorer.css';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CampaignExplorerProps {
  campaignId: string | null;
  onStreamingStateChange?: (isStreaming: boolean) => void;
  onDataChange?: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  apiResponse?: ApiResponse;
}

interface DbMessage {
  chatMessageId: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
  createdAt?: string;
  apiResponse?: ApiResponse;
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
    quick_idea: { angle: string; hook: string; description: string; };
    ideas: Array<{ angle: string; hook: string; description: string; }>;
    examples: unknown[];
    trends: Array<{ title: string; url: string; snippet: string; hooks: string[]; hashtags: string[]; audios: unknown[]; }>;
    selection: {
      selected: {
        angle: string;
        hook: string;
        description: string;
        scores: { [key: string]: number };
        rationale: string;
      };
      rejected: Array<{ idea: { angle: string; hook: string; description: string; }; reason: string; }>;
    };
    deliverable: {
      title: string;
      hook: string;
      visual_concepts: string[];
      copy_variants: string[];
      platform_tips: string[];
    };
  };
  result?: ApiResponse;
}

const CampaignExplorer: React.FC<CampaignExplorerProps> = ({ campaignId, onStreamingStateChange, onDataChange }) => {
  console.log('🎯 [CAMPAIGN-EXPLORER] Component rendered with campaignId:', campaignId);
  
  const router = useRouter();
  const [ideaPaneWidthPercent, setIdeaPaneWidthPercent] = useState(80);
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
  const [currentApiResponse, setCurrentApiResponse] = useState<ApiResponse | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeScoreReason, setActiveScoreReason] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Function to save chat messages to database
  const saveChatMessageToDatabase = async (campaignId: string, message: ChatMessage) => {
    console.log('💾 [DATABASE] Saving chat message to database:', message);
    console.log('💾 [DATABASE] ApiResponse being saved:', message.apiResponse);
    
    const payload = {
      campaignId: campaignId,
      message: {
        id: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
        apiResponse: message.apiResponse
      }
    };
    
    console.log('💾 [DATABASE] Full payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch('/api/chat/save-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log('📥 [DATABASE] Save response status:', response.status);
      console.log('📥 [DATABASE] Save response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ [DATABASE] Chat message saved successfully');
        return true;
      } else {
        console.error('❌ [DATABASE] Failed to save chat message:', data);
        console.error('❌ [DATABASE] Response status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('💥 [DATABASE] Exception saving chat message:', error);
      return false;
    }
  };

  const handleVerticalResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleHorizontalResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
      // Add timestamp to prevent caching  
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat?campaignId=${campaignId}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      
      console.log('📋 Chat messages API response:', data);
      
      if (response.ok && data.success) {
        const dbMessages = data.messages || [];
        console.log('✅ Loaded messages from DB:', dbMessages.length, 'messages:', dbMessages);
        
        // Convert DB messages to ChatMessage format
        const convertedMessages: ChatMessage[] = dbMessages.map((dbMsg: DbMessage) => {
          console.log('🔍 [DEBUG] Converting DB message:', dbMsg);
          console.log('🔍 [DEBUG] DB message apiResponse:', dbMsg.apiResponse);
          
          return {
            id: dbMsg.chatMessageId,
            text: dbMsg.message,
            sender: dbMsg.sender as 'user' | 'bot',
            timestamp: new Date(dbMsg.timestamp || dbMsg.createdAt),
            apiResponse: dbMsg.apiResponse
          };
        });
        
        // Set the most recent API response if available
        const lastBotMessage = convertedMessages
          .filter(msg => msg.sender === 'bot' && msg.apiResponse)
          .pop();
          
        console.log('🔍 [DEBUG] All bot messages with apiResponse:', convertedMessages.filter(msg => msg.sender === 'bot' && msg.apiResponse));
        console.log('🔍 [DEBUG] Last bot message:', lastBotMessage);
        console.log('🔍 [DEBUG] Last bot message apiResponse:', lastBotMessage?.apiResponse);
        
        if (lastBotMessage?.apiResponse?.result) {
          console.log('🎯 Setting current API response from last bot message:', lastBotMessage.apiResponse.result);
          setCurrentApiResponse(lastBotMessage.apiResponse.result);
        } else if (lastBotMessage?.apiResponse) {
          // Handle case where apiResponse is stored directly (not wrapped in result)
          console.log('🎯 Setting current API response directly from apiResponse:', lastBotMessage.apiResponse);
          setCurrentApiResponse(lastBotMessage.apiResponse);
        } else {
          console.log('⚠️ [DEBUG] No valid apiResponse found in last bot message');
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
    console.log('🎯 [CAMPAIGN-EXPLORER] Campaign ID changed:', campaignId);
    
    if (campaignId) {
      console.log('🎯 [CAMPAIGN-EXPLORER] Fetching messages for campaign:', campaignId);
      fetchChatMessages(campaignId);
    } else {
      console.log('🎯 [CAMPAIGN-EXPLORER] No campaign selected, showing default message');
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

  // Check for and handle initial prompts from create-project page
  useEffect(() => {
    if (!campaignId) return;

    const initialPromptKey = `initialPrompt_${campaignId}`;
    const initialPromptTimestampKey = `${initialPromptKey}_timestamp`;

    const initialPrompt = sessionStorage.getItem(initialPromptKey);
    const initialPromptTimestamp = sessionStorage.getItem(initialPromptTimestampKey);

    if (initialPrompt && initialPromptTimestamp) {
      const timestamp = parseInt(initialPromptTimestamp);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Check if the initial prompt is not too old (5 minutes max)
      if (now - timestamp < fiveMinutes) {
        console.log('🎯 [CAMPAIGN-EXPLORER] Found initial prompt from create-project, setting as input:', initialPrompt);
        setInputMessage(initialPrompt);

        // Clean up sessionStorage after processing
        sessionStorage.removeItem(initialPromptKey);
        sessionStorage.removeItem(initialPromptTimestampKey);
      } else {
        console.log('🎯 [CAMPAIGN-EXPLORER] Initial prompt is too old, ignoring');
        // Clean up old sessionStorage entries
        sessionStorage.removeItem(initialPromptKey);
        sessionStorage.removeItem(initialPromptTimestampKey);
      }
    }
  }, [campaignId]);



  const handleDeleteCampaign = async () => {
    if (!campaignId) {
      toast.error('Campaign ID not available');
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading('Deleting campaign and all chat messages...');

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        const summary = data.summary;
        toast.success(`Campaign deleted successfully! ${summary.chatMessagesDeleted} chat messages were also deleted.`, {
          duration: 5000,
        });
        
        // Notify parent to refresh sidebar data
        onDataChange?.();
        
        // Navigate back to home page
        router.push('/');
        
      } else {
        toast.error(`Failed to delete campaign: ${data.error || 'Unknown error'}`, {
          duration: 4000,
        });
      }

    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection and try again.', {
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSendMessage = useCallback(async () => {
    console.log('🚀 [CAMPAIGN-EXPLORER] handleSendMessage called');

    // Validation checks
    if (!inputMessage.trim()) {
      console.log('❌ [CAMPAIGN-EXPLORER] Validation failed: Empty input message');
      return;
    }

    if (!campaignId) {
      console.log('❌ [CAMPAIGN-EXPLORER] Validation failed: No campaign ID');
      return;
    }

    console.log('✅ [CAMPAIGN-EXPLORER] All validations passed, proceeding with message send');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    console.log('🎯 [CAMPAIGN-EXPLORER] User message created:', userMessage);

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Save user message to database
    console.log('💾 [API] About to save user message:', userMessage);
    saveChatMessageToDatabase(campaignId, userMessage).catch(error => {
      console.error('❌ [API] Failed to save user message:', error);
    });

    // For now, just add a placeholder bot response
    // This will be replaced with actual API integration in the new version
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm currently being rebuilt with new functionality. Please check back soon!",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

      if (campaignId) {
        saveChatMessageToDatabase(campaignId, botResponse).catch(error => {
          console.error('❌ [API] Failed to save bot message:', error);
        });
      }

      setTimeout(scrollToBottom, 100);
    }, 1000);

  }, [inputMessage, campaignId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log('⌨️ Key pressed:', e.key);
    console.log('⌨️ Shift key:', e.shiftKey);
    
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('✅ Enter key without shift - calling handleSendMessage');
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScoreClick = (scoreKey: string) => {
    setActiveScoreReason(activeScoreReason === scoreKey ? null : scoreKey);
  };


  const GaugeMeter: React.FC<{
    label: string;
    score: number;
    reason: string;
    scoreKey: string;
  }> = ({ label, score, reason, scoreKey }) => {
    const percentage = (score / 10) * 100;
    const isActive = activeScoreReason === scoreKey;
    const strokeDasharray = `${percentage * 1.57} 157`;
    
    return (
      <div className="gauge-card" style={{ 
        maxWidth: '200px',
        minWidth: '180px',
        flex: '1',
        
        borderRadius: '12px',
        padding: '20px',
        border: isActive ? '2px solid #4CAF50' : '0.3px solid #444',
        boxShadow: isActive ? 
          '0 8px 25px rgba(76, 175, 80, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)' :
          '0 4px 15px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}>
        <div 
          className="gauge-wrapper"
          onClick={() => handleScoreClick(scoreKey)}
        >
          <div className="gauge-label" style={{ 
            color: '#f0f0f0', 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {label}
          </div>
          
          <div className="semi-circular-gauge" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <svg width="120" height="65" style={{ marginBottom: '10px' }}>
              <defs>
                <linearGradient id={`gradient-${scoreKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={score >= 8 ? '#4CAF50' : score >= 6 ? '#FF9800' : '#f44336'} />
                  <stop offset="100%" stopColor={score >= 8 ? '#66BB6A' : score >= 6 ? '#FFB74D' : '#EF5350'} />
                </linearGradient>
              </defs>
              
              <path
                d="M 10 55 A 50 50 0 0 1 110 55"
                fill="none"
                stroke="#333"
                strokeWidth="8"
                strokeLinecap="round"
              />
              
              <path
                d="M 10 55 A 50 50 0 0 1 110 55"
                fill="none"
                stroke={`url(#gradient-${scoreKey})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                style={{
                  transition: 'stroke-dasharray 0.8s ease-in-out'
                }}
              />
            </svg>
            
            <div className="gauge-score" style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '28px',
              position: 'absolute',
              bottom: '15px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              {score}
            </div>
            
            <div style={{
              color: '#aaa',
              fontSize: '12px',
              fontWeight: 'normal',
              marginTop: '5px'
            }}>
              / 10
            </div>
          </div>
        </div>
        
        {isActive && (
          <div className="gauge-reason" style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '13px',
            lineHeight: '1.4',
            border: '1px solid #555',
            animation: 'fadeIn 0.3s ease-in-out',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {reason}
          </div>
        )}
      </div>
    );
  };

  // Check if we should show the top row with ideas and details
  const shouldShowTopRow = useMemo(() => {
    const shouldShow = !!(currentApiResponse?.ideas || currentApiResponse?.detials);
    console.log('🎨 [UI] Top row visibility check:', {
      shouldShow,
      hasIdeas: !!currentApiResponse?.ideas,
      hasDetails: !!currentApiResponse?.detials
    });
    return shouldShow;
  }, [currentApiResponse?.ideas, currentApiResponse?.detials]);

  return (
    <div className="campaign-explorer-layout">
      {/* Top Row - Ideas and Details - Show if there's content or streaming data */}
      {shouldShowTopRow ? (
        <div 
          className="top-row" 
          style={{ height: `${topPanesHeightPercent}%` }}
        >
        {/* Idea View - Top Left */}
        <div 
          className="idea-view"
          style={{ width: `${ideaPaneWidthPercent}%` }}
        >
          <div className="pane-content">
            {currentApiResponse?.ideas ? (
              <div className="ideas-content">
                {/* Selected Idea - Priority Display */}
                {currentApiResponse.ideas.selection?.selected && (
                  <div className="section selected-idea-priority">
                    
                    <div className="selected-idea-card">
                      <div className="idea-angle" style={{ fontWeight: 'bold', color: '#a1a1a1', fontSize: '1.3em', marginTop: '10px' }}>
                        {currentApiResponse.ideas.selection.selected.angle}
                      </div>
                      <div className="idea-hook" style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.6em' }}>
                        &ldquo;{currentApiResponse.ideas.selection.selected.hook}&rdquo;
                      </div>
                      <div className="idea-description" style={{ color: '#a6a6a6', marginTop: '8px' , fontSize: '1.2em' }}>
                        {currentApiResponse.ideas.selection.selected.description}
                      </div>
                      <div className="rationale" style={{ color: '#a5a5a5', marginTop: '15px', fontStyle: 'italic', fontSize: '1em' }}>
                        {currentApiResponse.ideas.selection.selected.rationale}
                      </div>
                      
                    </div>
                  </div>
                )}

                {/* Deliverables Section */}
                {currentApiResponse.ideas.deliverable && (
                  <div className="section deliverable-section">
                    
                    <div className="deliverable">
                      <div className="deliverable-title" style={{ fontWeight: 'bold', color: '#f0f0f0', fontSize: '1.1em' }}>
                        {currentApiResponse.ideas.deliverable.title}
                      </div>
                      <div className="deliverable-hook" style={{ color: '#f3f3f3', marginTop: '8px' }}>
                        Hook: &ldquo;{currentApiResponse.ideas.deliverable.hook}&rdquo;
                      </div>
                      
                      <div className="subsection">
                        <h5 style={{ color: '#f0f0f0', fontWeight: 'bold' }}>Visual Concepts</h5>
                        <ul style={{ color: '#f5f5f5' }}>
                          {currentApiResponse.ideas.deliverable.visual_concepts?.map((concept, index) => (
                            <li key={index}>{concept}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="subsection">
                        <h5 style={{ color: '#f0f0f0', fontWeight: 'bold' }}>Copy Variants</h5>
                        <ul style={{ color: '#f5f5f5' }}>
                          {currentApiResponse.ideas.deliverable.copy_variants?.map((copy, index) => (
                            <li key={index}>&ldquo;{copy}&rdquo;</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-content" style={{ color: '#666' }}>Selected idea and deliverables will appear here after you send a message</div>
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
          <div className="pane-content">
            {currentApiResponse?.ideas || currentApiResponse?.detials ? (
              <div className="details-content">
                
                
                {currentApiResponse?.detials && (
                  <div className="section">
                    
                    <div className="format-info" style={{ color: '#f5f5f5' }}>{currentApiResponse.detials.format}</div>
                  </div>
                )}

                {currentApiResponse?.detials?.critic && (
                  <div className="section">
                    
                    <div className="overall-score" style={{
                      marginBottom: '30px',
                      padding: '20px',
                      backgroundColor: '#000',
                      
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '2px solid #000',
                      boxShadow: currentApiResponse.detials.critic.overall >= 8 ? '0px -1px 1px #4CAF50' : 
                               currentApiResponse.detials.critic.overall >= 6 ? '0px -1px 1px #FF9800' : '0px -1px 1px #f44336',
                    }}>
                      <div style={{ color: '#f0f0f0', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>Overall Score</div>
                      <div style={{ 
                        color: currentApiResponse.detials.critic.overall >= 8 ? '#4CAF50' : 
                               currentApiResponse.detials.critic.overall >= 6 ? '#FF9800' : '#f44336',
                        fontWeight: '900', 
                        
                        fontSize: '48px',
                        textShadow: '0 4px 8px rgba(0, 0, 0, 0.6)',
                        letterSpacing: '2px'
                      }}>
                        {currentApiResponse.detials.critic.overall}/10
                      </div>
                    </div>
                    
                    <div className="critic-scores" style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '16px',
                      justifyContent: 'center'
                    }}>
                      <GaugeMeter 
                        label="Attention"
                        score={currentApiResponse.detials.critic.attention?.score || 0}
                        reason={currentApiResponse.detials.critic.attention?.reason || ''}
                        scoreKey="attention"
                      />
                      
                      <GaugeMeter 
                        label="Trend Fit"
                        score={currentApiResponse.detials.critic.trend_fit?.score || 0}
                        reason={currentApiResponse.detials.critic.trend_fit?.reason || ''}
                        scoreKey="trend_fit"
                      />
                      
                      <GaugeMeter 
                        label="Originality"
                        score={currentApiResponse.detials.critic.originality?.score || 0}
                        reason={currentApiResponse.detials.critic.originality?.reason || ''}
                        scoreKey="originality"
                      />
                      
                      <GaugeMeter 
                        label="Brand Fit"
                        score={currentApiResponse.detials.critic.brand_fit?.score || 0}
                        reason={currentApiResponse.detials.critic.brand_fit?.reason || ''}
                        scoreKey="brand_fit"
                      />
                    </div>
                    
                    {currentApiResponse.detials.critic.improvements?.length > 0 && (
                      <div className="improvements">
                        <h5 style={{ color: '#000', fontWeight: 'bold' }}>Suggested Improvements</h5>
                        <ul style={{ color: '#555' }}>
                          {currentApiResponse.detials.critic.improvements.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Quick Idea Section */}
                {currentApiResponse?.ideas?.quick_idea && (
                  <div className="section">
                    <h5 style={{ color: '#4CAF50', fontWeight: 'bold' }}>💡 Quick Idea</h5>
                    <div className="quick-idea-card" style={{ 
                      backgroundColor: '#0a0a0a', 
                      border: '1px solid #4CAF50',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      padding: '15px'
                    }}>
                      <div className="quick-idea-hook" style={{ 
                        color: '#4CAF50', 
                        fontWeight: 'bold', 
                        fontSize: '1.2em',
                        marginBottom: '8px'
                      }}>
                        &ldquo;{currentApiResponse.ideas.quick_idea.hook}&rdquo;
                      </div>
                      <div className="quick-idea-angle" style={{ 
                        color: '#f0f0f0', 
                        fontWeight: '400', 
                        marginBottom: '8px'
                      }}>
                        Angle: {currentApiResponse.ideas.quick_idea.angle}
                      </div>
                      <div className="quick-idea-description" style={{ 
                        color: '#f6f6f6', 
                        fontSize: '0.9em' 
                      }}>
                        {currentApiResponse.ideas.quick_idea.description}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Generated Ideas Section - Moved from Ideas Pane */}
                {currentApiResponse?.ideas?.ideas && (
                  <div className="section">
                    <h5 style={{ color: '#f0f0f0', fontWeight: 'bold' }}>Other Directions</h5>

                    <div className="generated-ideas-list">
                      {currentApiResponse.ideas.ideas.map((idea, index) => (
                        <div key={index} className="idea-card" style={{ 
                          backgroundColor: '#080808', 
                          
                          marginBottom: '12px',
                          padding: '12px'
                        }}>
                          <div className="idea-angle" style={{ color: '#f0f0f0', fontWeight: '400', fontSize: '1em' }}>{idea.angle}</div>
                          <div className="idea-hook" style={{ color: '#f3f3f3', fontStyle: 'italic', marginTop: '4px', fontSize: '1.3em' }}>&ldquo;{idea.hook}&rdquo;</div>
                          <div className="idea-description" style={{ color: '#f6f6f6', marginTop: '6px', fontSize: '0.9em' }}>{idea.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="empty-content" style={{ color: '#666' }}>Analysis details and generated ideas will appear here after you send a message</div>
            )}
          </div>
        </div>
        </div>
      ) : null}
        {/* Horizontal Resize Handle */}
        <div 
          className="resize-handle resize-handle-horizontal"
          onMouseDown={handleVerticalResize}
        />
      

      {/* Chat Box - Full height when no content, bottom when content exists */}
      <div 
        className="chat-box"
        style={{ 
          height: shouldShowTopRow ? `${100 - topPanesHeightPercent}%` : '100%' 
        }}
      >
        <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Chat Assistant</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {campaignId && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
              >
                🗑️ Delete Campaign
              </button>
            )}
          </div>
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
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                  console.log('🖱️ Button disabled:', !inputMessage.trim());
                  console.log('🖱️ Input message:', inputMessage);
                  handleSendMessage();
                }}
                disabled={!inputMessage.trim()}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Delete Campaign</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete this campaign?
            </p>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5', color: '#666' }}>
              This will permanently delete:
              <br />• The campaign and all its data
              <br />• All chat messages in this campaign
            </p>
            <p style={{ marginBottom: '2rem', color: '#dc3545', fontWeight: 'bold' }}>
              This action cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignExplorer;
