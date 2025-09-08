import React, { useState, useRef, useCallback, useEffect } from 'react';
import './CampaignExplorer.css';
import { useWebSocket, WebSocketStatus, WebSocketMessage } from '../hooks/useWebSocket';

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
  console.log('🎯 [CAMPAIGN-EXPLORER] Component rendered with campaignId:', campaignId);
  
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
  const [isTyping, setIsTyping] = useState(false);
  const [currentApiResponse, setCurrentApiResponse] = useState<ApiResponse | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeScoreReason, setActiveScoreReason] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket, status: wsStatus, sendMessage, connect, disconnect, lastMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_SREVE_CREATOR_WEBSOCKET_ENDPOINT || 'wss://9ofoev2w94.execute-api.ap-south-1.amazonaws.com/api'
  );

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
        console.log('🎯 [CAMPAIGN-EXPLORER] Found initial prompt from create-project, sending automatically:', initialPrompt);
        
        // Auto-send using the new on-demand approach
        setTimeout(() => {
          console.log('🎯 [CAMPAIGN-EXPLORER] Auto-sending initial prompt via on-demand WebSocket');
          setInputMessage(initialPrompt);
          
          // Set pending message instead of calling handleSendMessage directly
          setPendingMessage(initialPrompt);
          
          // Connect WebSocket - the pending message will be sent when connected
          console.log('🎯 [CAMPAIGN-EXPLORER] Connecting WebSocket for initial prompt');
          connect();
        }, 1000);
        
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
  }, [campaignId, connect]);

  // Handle pending messages when WebSocket connects
  useEffect(() => {
    if (wsStatus === 'connected' && pendingMessage && campaignId) {
      console.log('🚀 [CAMPAIGN-EXPLORER] WebSocket connected, sending pending message:', pendingMessage);
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: pendingMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setStreamingStatus('Sending message...');

      const messagePayload = {
        action: 'generate',
        query: pendingMessage
      };

      const success = sendMessage(messagePayload);
      
      if (!success) {
        console.error('❌ [CAMPAIGN-EXPLORER] Failed to send pending message');
        setStreamingStatus('❌ Failed to send message');
        setIsStreaming(false);
      }

      // Clear pending message
      setPendingMessage(null);
    }
  }, [wsStatus, pendingMessage, campaignId, sendMessage]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 [CAMPAIGN-EXPLORER] Component unmounting, cleaning up WebSocket');
      disconnect();
    };
  }, [disconnect]);

  // Handle WebSocket messages
  useEffect(() => {
    console.log('📨 [CAMPAIGN-EXPLORER] WebSocket message effect triggered');
    console.log('🔍 [CAMPAIGN-EXPLORER] lastMessage value:', lastMessage);
    
    if (!lastMessage) {
      console.log('⚠️ [CAMPAIGN-EXPLORER] No lastMessage, skipping processing');
      return;
    }

    console.log('🎯 [CAMPAIGN-EXPLORER] Processing WebSocket message:', {
      type: lastMessage.type,
      hasData: !!lastMessage.data,
      hasMessage: !!lastMessage.message,
      hasError: !!lastMessage.error,
      timestamp: new Date().toISOString()
    });

    switch (lastMessage.type) {
      case 'start':
        console.log('🎯 [WEBSOCKET] Generation started:', lastMessage.message);
        setStreamingStatus(lastMessage.message || 'Starting content generation...');
        break;

      case 'stream':
        if (lastMessage.data) {
          const statusMessages: Record<string, string> = {
            connected: '🔗 Connected to AI',
            start: '🚀 Starting content generation...',
            intent: '🎯 Analyzing your request...',
            examples: '📚 Researching examples...',
            trends: '📈 Finding trending topics...',
            ideation: '💡 Generating creative ideas...',
            selection: '✨ Selecting the best idea...',
            script: '📝 Creating your content...',
            critique: '🔍 Reviewing and improving...',
            packaging: '📦 Finalizing output...',
            complete: '✅ Content generation complete!',
            stored: '💾 Saved successfully!'
          };

          const statusMessage = statusMessages[lastMessage.data.step] || 
                               lastMessage.data.message || 
                               `Processing: ${lastMessage.data.step}`;
          setStreamingStatus(statusMessage);

          if (lastMessage.data.result) {
            console.log('🎯 [WEBSOCKET] Final result received');
            setCurrentApiResponse(lastMessage.data.result);
          }
        }
        break;

      case 'complete':
        console.log('🎯 [WEBSOCKET] Generation completed:', lastMessage.message);
        setIsStreaming(false);
        setStreamingStatus(null);
        
        // Create final bot message if we have a result
        if (currentApiResponse) {
          const botResponse: ChatMessage = {
            id: (Date.now()).toString(),
            text: currentApiResponse?.chat?.thinking || 'I\'ve analyzed your request and generated ideas for you.',
            sender: 'bot',
            timestamp: new Date(),
            apiResponse: { result: currentApiResponse }
          };

          setMessages(prev => [...prev, botResponse]);
          
          // Show clarifying questions if any
          if (currentApiResponse?.chat?.clarifying_questions?.length > 0) {
            setTimeout(() => {
              const clarifyingMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: `I have some clarifying questions: ${currentApiResponse.chat.clarifying_questions.join('; ')}`,
                sender: 'bot',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, clarifyingMessage]);
              setTimeout(scrollToBottom, 100);
            }, 1000);
          }
          
          setTimeout(scrollToBottom, 100);
        }

        // Disconnect WebSocket after completion
        console.log('🔌 [CAMPAIGN-EXPLORER] Content generation complete, disconnecting WebSocket');
        setTimeout(() => {
          disconnect();
          console.log('✅ [CAMPAIGN-EXPLORER] WebSocket disconnected after completion');
        }, 2000); // Small delay to ensure all messages are processed
        
        break;

      case 'error':
        console.error('🎯 [WEBSOCKET] Error:', lastMessage.error || lastMessage.message);
        setIsStreaming(false);
        setStreamingStatus('❌ Error occurred');
        
        const errorMessage: ChatMessage = {
          id: (Date.now()).toString(),
          text: `Sorry, I encountered an error: ${lastMessage.error || lastMessage.message}. Please try again.`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setTimeout(scrollToBottom, 100);

        // Disconnect WebSocket after error
        console.log('🔌 [CAMPAIGN-EXPLORER] Error occurred, disconnecting WebSocket');
        setTimeout(() => {
          disconnect();
          console.log('✅ [CAMPAIGN-EXPLORER] WebSocket disconnected after error');
        }, 1000);
        
        break;
    }
  }, [lastMessage, currentApiResponse]);

  const handleSendMessage = useCallback(async () => {
    console.log('🚀 [CAMPAIGN-EXPLORER] handleSendMessage called');
    console.log('🎯 [CAMPAIGN-EXPLORER] Function parameters:', {
      inputMessage: inputMessage,
      inputMessageLength: inputMessage?.length,
      campaignId: campaignId,
      wsStatus: wsStatus,
      isStreaming: isStreaming
    });
    
    // Validation checks with detailed logging
    if (!inputMessage.trim()) {
      console.log('❌ [CAMPAIGN-EXPLORER] Validation failed: Empty input message');
      console.log('🔍 [CAMPAIGN-EXPLORER] Input message details:', {
        original: inputMessage,
        trimmed: inputMessage.trim(),
        length: inputMessage.length
      });
      return;
    }
    
    if (!campaignId) {
      console.log('❌ [CAMPAIGN-EXPLORER] Validation failed: No campaign ID');
      console.log('🔍 [CAMPAIGN-EXPLORER] Campaign ID value:', campaignId);
      return;
    }

    // Check if we need to connect first
    if (wsStatus !== 'connected') {
      console.log('🔄 [CAMPAIGN-EXPLORER] WebSocket not connected, initiating connection');
      console.log('🔍 [CAMPAIGN-EXPLORER] WebSocket status details:', {
        currentStatus: wsStatus,
        socket: !!socket,
        socketReadyState: socket?.readyState
      });
      
      // Start connection process
      setStreamingStatus('Connecting to server...');
      
      // Add small delay to prevent rapid re-connections in React Strict Mode
      setTimeout(() => {
        connect();
      }, 100);
      
      // Store the message to send after connection
      console.log('📝 [CAMPAIGN-EXPLORER] Storing message to send after connection');
      setPendingMessage(inputMessage.trim());
      setInputMessage('');
      setIsStreaming(true);
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
    
    setMessages(prev => {
      console.log('📝 [CAMPAIGN-EXPLORER] Adding user message to chat, current message count:', prev.length);
      return [...prev, userMessage];
    });
    setInputMessage('');
    setIsStreaming(true);
    setStreamingStatus('Sending message...');
    
    console.log('🎯 [CAMPAIGN-EXPLORER] UI state updated, preparing WebSocket message');

    try {
      const messagePayload = {
        action: 'generate',
        query: userMessage.text
      };
      
      console.log('🎯 [CAMPAIGN-EXPLORER] WebSocket message payload:', messagePayload);
      console.log('🎯 [CAMPAIGN-EXPLORER] About to call sendMessage function...');
      
      const success = sendMessage(messagePayload);
      
      console.log('🎯 [CAMPAIGN-EXPLORER] sendMessage function returned:', success);
      console.log('🎯 [CAMPAIGN-EXPLORER] Return type:', typeof success);

      if (!success) {
        console.error('❌ [CAMPAIGN-EXPLORER] sendMessage returned false - message failed to send');
        console.error('🔍 [CAMPAIGN-EXPLORER] Possible reasons:', [
          'WebSocket not connected',
          'WebSocket in wrong state', 
          'JSON.stringify failed',
          'socket.send() threw exception'
        ]);
        console.error('🌐 [CAMPAIGN-EXPLORER] WebSocket endpoint being used:', process.env.NEXT_PUBLIC_SREVE_CREATOR_WEBSOCKET_ENDPOINT);
        throw new Error('Failed to send message via WebSocket. Please check if the WebSocket endpoint is accessible.');
      }

      console.log('✅ [CAMPAIGN-EXPLORER] WebSocket message sent successfully');
      console.log('⏳ [CAMPAIGN-EXPLORER] Waiting for WebSocket response...');
      
    } catch (error: any) {
      console.error('💥 [CAMPAIGN-EXPLORER] Exception in handleSendMessage:', error);
      console.error('🔍 [CAMPAIGN-EXPLORER] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.error('📊 [CAMPAIGN-EXPLORER] Context when error occurred:', {
        wsStatus: wsStatus,
        socket: !!socket,
        socketReadyState: socket?.readyState,
        campaignId: campaignId,
        userMessageText: userMessage.text
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingStatus('❌ Error occurred');
      setIsStreaming(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [inputMessage, campaignId, wsStatus, sendMessage]);

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

  const getConnectionStatusInfo = (status: WebSocketStatus) => {
    switch (status) {
      case 'connecting':
        return { text: 'Connecting...', color: '#FF9800', icon: '🔄' };
      case 'connected':
        return { text: 'Streaming...', color: '#4CAF50', icon: '🟢' };
      case 'disconnected':
        return { text: 'Ready', color: '#4CAF50', icon: '⚡' };
      case 'reconnecting':
        return { text: 'Reconnecting...', color: '#FF9800', icon: '🔄' };
      case 'error':
        return { text: 'Connection Error', color: '#f44336', icon: '🔴' };
      default:
        return { text: 'Ready', color: '#4CAF50', icon: '⚡' };
    }
  };

  const ConnectionStatus: React.FC = () => {
    const statusInfo = getConnectionStatusInfo(wsStatus);
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: '#2a2a2a',
        borderRadius: '20px',
        border: '1px solid #444',
        fontSize: '12px',
        color: statusInfo.color,
        fontWeight: '500'
      }}>
        <span style={{ fontSize: '10px' }}>{statusInfo.icon}</span>
        <span>{statusInfo.text}</span>
        {wsStatus === 'error' && (
          <button
            onClick={connect}
            style={{
              marginLeft: '8px',
              padding: '2px 8px',
              fontSize: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
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

  return (
    <div className="campaign-explorer-layout">
      {/* Top Row - Ideas and Details - Only show if there's content */}
      {currentApiResponse?.ideas || currentApiResponse?.detials ? (
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
                        "{currentApiResponse.ideas.selection.selected.hook}"
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
                        Hook: "{currentApiResponse.ideas.deliverable.hook}"
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
                            <li key={index}>"{copy}"</li>
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
                          <div className="idea-hook" style={{ color: '#f3f3f3', fontStyle: 'italic', marginTop: '4px', fontSize: '1.3em' }}>"{idea.hook}"</div>
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

        {/* Horizontal Resize Handle */}
        <div 
          className="resize-handle resize-handle-horizontal"
          onMouseDown={handleVerticalResize}
        />
      </div>
      ) : null}

      {/* Chat Box - Full height when no content, bottom when content exists */}
      <div 
        className="chat-box"
        style={{ 
          height: currentApiResponse?.ideas || currentApiResponse?.detials 
            ? `${100 - topPanesHeightPercent}%` 
            : '100%' 
        }}
      >
        <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Chat Assistant</h3>
          <ConnectionStatus />
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
            {isStreaming && streamingStatus && (
              <div className="message message-bot">
                <div className="message-content">
                  <div className="streaming-status">
                    <div className="streaming-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p style={{ margin: '0 0 0 10px', fontSize: '14px', color: '#666' }}>
                      {streamingStatus}
                    </p>
                  </div>
                  <span className="message-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
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
                  console.log('🖱️ Button disabled:', !inputMessage.trim() || isStreaming);
                  console.log('🖱️ Input message:', inputMessage);
                  console.log('🖱️ Is streaming:', isStreaming);
                  handleSendMessage();
                }}
                disabled={!inputMessage.trim() || isStreaming}
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
