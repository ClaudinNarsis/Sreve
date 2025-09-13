import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import './CampaignExplorer.css';
import { useWebSocket, WebSocketStatus } from '../hooks/useWebSocket';
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
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingData, setStreamingData] = useState<Record<string, unknown> | null>(null);
  
  // Add debug useEffect to track streamingData changes
  useEffect(() => {
    console.log('🔄 [STATE] streamingData changed:', streamingData);
  }, [streamingData]);
  const [activeScoreReason, setActiveScoreReason] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const allStreamingSteps = useRef<Record<string, unknown>>({});
  const completionProcessed = useRef<boolean>(false);

  // Function to build final result from streaming steps
  const buildFinalResultFromStreaming = (currentStreamingData: unknown, allSteps: Record<string, unknown>): ApiResponse | null => {
    console.log('🔧 [BUILD-RESULT] Building final result from steps:', { currentStreamingData, allSteps });
    
    // If we don't have enough data, return null
    if (!allSteps || Object.keys(allSteps).length === 0) {
      console.log('⚠️ [BUILD-RESULT] No streaming steps available');
      return null;
    }

    // Build the final result structure
    try {
      const streamingData = currentStreamingData as { topic?: string };
      const steps = allSteps as Record<string, { data?: Record<string, unknown> }>;
      
      const finalResult: ApiResponse = {
        chat: {
          thinking: (steps.intent?.data?.rationale as string) || 'I\'ve analyzed your request and generated ideas for you.',
          clarifying_questions: (steps.intent?.data?.clarifying_questions as string[]) || [],
          topic: streamingData?.topic || 'Campaign Ideas'
        },
        detials: {
          format: (steps.intent?.data?.format as string) || 'Static ad script',
          critic: (steps.critique?.data as ApiResponse['detials']['critic']) || {
            attention: { score: 8, reason: 'Generated compelling hooks' },
            trend_fit: { score: 7, reason: 'Aligned with current trends' },
            originality: { score: 8, reason: 'Creative and unique approach' },
            brand_fit: { score: 9, reason: 'Perfect for target audience' },
            overall: 8.0,
            improvements: ['Consider adding more specific product features', 'Test different hook variations']
          }
        },
        ideas: {
          quick_idea: (steps.quick_idea?.data as { angle: string; hook: string; description: string; }) || { angle: '', hook: '', description: '' },
          ideas: (Array.isArray(steps.ideation?.data) ? steps.ideation.data : []) as Array<{ angle: string; hook: string; description: string; }>,
          examples: (Array.isArray(steps.examples?.data) ? steps.examples.data : []) as unknown[],
          trends: (Array.isArray(steps.trends?.data) ? steps.trends.data : []) as Array<{ title: string; url: string; snippet: string; hooks: string[]; hashtags: string[]; audios: unknown[]; }>,
          selection: (steps.selection?.data as ApiResponse['ideas']['selection']) || {
            selected: { angle: '', hook: '', description: '', scores: {}, rationale: '' },
            rejected: []
          },
          deliverable: (steps.script?.data as ApiResponse['ideas']['deliverable']) || {
            title: '',
            hook: '',
            visual_concepts: [],
            copy_variants: [],
            platform_tips: []
          }
        }
      };

      console.log('✅ [BUILD-RESULT] Successfully built final result:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('❌ [BUILD-RESULT] Error building final result:', error);
      return null;
    }
  };

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
  
  const { socket, status: wsStatus, sendMessage, connect, disconnect, lastMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_SREVE_CREATOR_WEBSOCKET_ENDPOINT || 'wss://kajg8zc828.execute-api.ap-south-1.amazonaws.com/dev'
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

      // Store the user message for potential restoration if webhook fails
      setLastUserMessage(pendingMessage);

      setMessages(prev => [...prev, userMessage]);
      setStreamingStatus('Sending message...');
      
      // Save user message to database
      console.log('💾 [WEBSOCKET] About to save pending user message:', userMessage);
      saveChatMessageToDatabase(campaignId, userMessage).catch(error => {
        console.error('❌ [WEBSOCKET] Failed to save user message:', error);
      });

      const messagePayload = {
        action: 'generate',
        query: pendingMessage
      };

      const success = sendMessage(messagePayload);
      
      if (!success) {
        console.error('❌ [CAMPAIGN-EXPLORER] Failed to send pending message');
        setStreamingStatus('❌ Failed to send message');
        setIsStreaming(false);
        // If sending fails, restore the message in the textbox for user to retry
        setInputMessage(pendingMessage);
        // Remove the user message from chat since it failed to send
        setMessages(prev => prev.slice(0, -1));
        setLastUserMessage(null);
      } else {
        // Clear the input message when successfully sent
        setInputMessage('');
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

    // Handle messages without proper type (like timeout messages)
    if (!lastMessage.type) {
      if (lastMessage.message && lastMessage.message.includes('timed out')) {
        console.log('⏰ [CAMPAIGN-EXPLORER] Received timeout message, ignoring');
        return;
      }
      console.log('⚠️ [CAMPAIGN-EXPLORER] Message without type, ignoring:', lastMessage);
      return;
    }

    switch (lastMessage.type) {
      case 'start':
        console.log('🎯 [WEBSOCKET] Generation started:', lastMessage.message);
        setStreamingStatus(lastMessage.message || 'Starting content generation...');
        // Reset completion flag when new streaming starts
        completionProcessed.current = false;
        break;

      case 'stream':
        // Handle both data object format and direct step format
        const stepData = lastMessage.data || {
          step: lastMessage.step,
          message: lastMessage.message,
          status: lastMessage.status,
          data: lastMessage.data,
          result: lastMessage.result
        };
        
        if (stepData.step) {
          const statusMessages: Record<string, string> = {
            connected: '🔗 Connected to AI',
            start: '🚀 Starting content generation...',
            intent: '🎯 Classifying intent...',
            quick_idea: '💡 Generating quick idea...',
            examples: '📚 Researching examples...',
            trends: '📈 Researching trends...',
            ideation: '💡 Enhancing ideas with research...',
            selection: '✨ Selecting best idea...',
            script: '📝 Generating script...',
            critique: '🔍 Critiquing script...',
            packaging: '📦 Packaging final output...',
            complete: '✅ Content generation complete!',
            stored: '💾 Saved successfully!'
          };

          const statusMessage = statusMessages[stepData.step] || 
                               stepData.message || 
                               `Processing: ${stepData.step}`;
          setStreamingStatus(statusMessage);

          // Store streaming data for real-time display - only update when complete
          if (stepData.status === 'complete' && stepData.data) {
            console.log('📊 [WEBSOCKET] Step completed with data:', stepData.step);
            console.log('📊 [WEBSOCKET] Data content:', stepData.data);
            
            // Track this step in allStreamingSteps
            allStreamingSteps.current[stepData.step] = {
              step: stepData.step,
              status: stepData.status,
              data: stepData.data,
              timestamp: Date.now()
            };
            console.log('📊 [WEBSOCKET] Updated allStreamingSteps:', allStreamingSteps.current);
            
            setStreamingData({
              step: stepData.step,
              status: stepData.status,
              data: { ...stepData.data }, // Create new object to trigger re-render
              timestamp: Date.now() // Add timestamp to force update
            });
          } else if (stepData.status === 'in_progress') {
            // For in_progress, don't update streamingData at all - idea pane should stay unchanged
            console.log('📊 [WEBSOCKET] Step in progress (not updating idea pane):', stepData.step);
          }

          // Handle direct result at top level (backend sends result in complete message)
          if (stepData.result || lastMessage.result) {
            const result = stepData.result || lastMessage.result;
            console.log('🎯 [WEBSOCKET] Final result received:', result);
            setCurrentApiResponse(result as unknown as ApiResponse);
            setStreamingData(null); // Clear streaming data when final result is received
          }
        }
        break;

      case 'complete':
        console.log('🎯 [WEBSOCKET] Generation completed:', lastMessage.message);
        
        // Check if completion has already been processed to prevent infinite loop
        if (completionProcessed.current) {
          console.log('⚠️ [WEBSOCKET] Completion already processed, skipping');
          break;
        }
        completionProcessed.current = true;
        
        setIsStreaming(false);
        setStreamingStatus(null);
        
        // Clear the stored user message since the generation completed successfully
        setLastUserMessage(null);
        
        // Build final result from streaming data and previous steps
        const finalResult = buildFinalResultFromStreaming(streamingData, allStreamingSteps.current);
        if (finalResult) {
          console.log('🎯 [WEBSOCKET] Built final result from streaming data:', finalResult);
          setCurrentApiResponse(finalResult);
          
          // Save will be handled when the bot message is created below
          
          // Keep the final streaming data visible
          // setStreamingData(null); // Don't clear - keep the final result visible
        }
        
        // Create final bot message if we have a result
        const resultToUse = finalResult || currentApiResponse;
        if (resultToUse) {
          const botResponse: ChatMessage = {
            id: (Date.now()).toString(),
            text: resultToUse?.chat?.thinking || 'I\'ve analyzed your request and generated ideas for you.',
            sender: 'bot',
            timestamp: new Date(),
            apiResponse: resultToUse
          };

          console.log('🔍 [DEBUG] Creating bot response with apiResponse:', botResponse.apiResponse);
          console.log('🔍 [DEBUG] ResultToUse structure:', JSON.stringify(resultToUse, null, 2));

          // Check for duplicates BEFORE updating messages
          const currentMessages = messages;
          const lastMessage = currentMessages[currentMessages.length - 1];
          console.log('🔍 [DEBUG] Last message before adding bot response:', lastMessage);
          console.log('🔍 [DEBUG] Last message has apiResponse?', !!lastMessage?.apiResponse);
          
          // More specific duplicate detection: only prevent if the last message is a bot message 
          // created in the last 30 seconds (indicating it's from the current session)
          const now = new Date().getTime();
          const thirtySecondsAgo = now - 30000;
          const lastMessageTime = lastMessage?.timestamp ? new Date(lastMessage.timestamp).getTime() : 0;
          
          const isDuplicate = lastMessage?.sender === 'bot' && 
                             lastMessage?.apiResponse && 
                             lastMessageTime > thirtySecondsAgo;
          
          if (isDuplicate) {
            console.log('⚠️ [WEBSOCKET] Recent bot message with apiResponse already exists (from current session), not adding duplicate');
            console.log('⚠️ [WEBSOCKET] Last message timestamp:', new Date(lastMessage.timestamp));
            console.log('⚠️ [WEBSOCKET] This means the bot message will NOT be saved to database');
          } else {
            console.log('✅ [WEBSOCKET] No recent duplicate found, adding new bot message and will save to database');
            
            // Add the bot message to the chat
            setMessages(prev => [...prev, botResponse]);
            
            // Save to database
            if (campaignId) {
              console.log('💾 [WEBSOCKET] About to save bot message:', botResponse);
              console.log('💾 [WEBSOCKET] Bot message apiResponse:', botResponse.apiResponse);
              saveChatMessageToDatabase(campaignId, botResponse)
                .then(success => {
                  if (success) {
                    console.log('✅ [WEBSOCKET] Bot message saved successfully, refreshing messages to verify...');
                    // Add a small delay and refresh messages to verify saving worked
                    setTimeout(() => {
                      console.log('🔄 [WEBSOCKET] Refreshing messages to verify save worked');
                      fetchChatMessages(campaignId);
                    }, 1000);
                  }
                })
                .catch(error => {
                  console.error('❌ [WEBSOCKET] Failed to save bot message:', error);
                });
            }
          }
          
          // Show clarifying questions if any
          if (resultToUse?.chat?.clarifying_questions?.length > 0) {
            setTimeout(() => {
              const clarifyingMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: `I have some clarifying questions: ${resultToUse.chat.clarifying_questions.join('; ')}`,
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
        setStreamingStatus(null);
        setStreamingData(null);
        
        // Restore the last user message to the textbox for retry
        if (lastUserMessage) {
          console.log('🔄 [WEBSOCKET] Restoring user message to textbox after error:', lastUserMessage);
          setInputMessage(lastUserMessage);
          
          // Remove the user message from chat history since it failed to process
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => 
              !(msg.sender === 'user' && msg.text === lastUserMessage && 
                Math.abs(new Date(msg.timestamp).getTime() - Date.now()) < 60000) // Within last minute
            );
            console.log('🗑️ [WEBSOCKET] Removed failed user message from chat, remaining messages:', filteredMessages.length);
            return filteredMessages;
          });
          
          // Clear the stored message after restoration
          setLastUserMessage(null);
        }
        
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
  }, [lastMessage]);

  // Notify parent component about streaming state changes
  useEffect(() => {
    if (onStreamingStateChange) {
      onStreamingStateChange(isStreaming);
    }
  }, [isStreaming, onStreamingStateChange]);

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
      // Clear previous streaming steps and reset completion flag
      allStreamingSteps.current = {};
      completionProcessed.current = false;
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
    
    // Store the user message for potential restoration if webhook fails
    setLastUserMessage(userMessage.text);
    
    setMessages(prev => {
      console.log('📝 [CAMPAIGN-EXPLORER] Adding user message to chat, current message count:', prev.length);
      return [...prev, userMessage];
    });
    setInputMessage('');
    setIsStreaming(true);
    setStreamingStatus('Sending message...');
    // Clear previous streaming steps and reset completion flag
    allStreamingSteps.current = {};
    completionProcessed.current = false;
    
    // Save user message to database
    console.log('💾 [WEBSOCKET] About to save direct user message:', userMessage);
    saveChatMessageToDatabase(campaignId, userMessage).catch(error => {
      console.error('❌ [WEBSOCKET] Failed to save user message:', error);
    });
    
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
        
        // Restore the message to textbox and remove from chat since it failed to send
        setInputMessage(userMessage.text);
        setMessages(prev => prev.slice(0, -1)); // Remove the last user message
        setLastUserMessage(null); // Clear stored message
        
        throw new Error('Failed to send message via WebSocket. Please check if the WebSocket endpoint is accessible.');
      }

      console.log('✅ [CAMPAIGN-EXPLORER] WebSocket message sent successfully');
      console.log('⏳ [CAMPAIGN-EXPLORER] Waiting for WebSocket response...');
      
    } catch (error: unknown) {
      console.error('💥 [CAMPAIGN-EXPLORER] Exception in handleSendMessage:', error);
      console.error('🔍 [CAMPAIGN-EXPLORER] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('📊 [CAMPAIGN-EXPLORER] Context when error occurred:', {
        wsStatus: wsStatus,
        socket: !!socket,
        socketReadyState: socket?.readyState,
        campaignId: campaignId,
        userMessageText: userMessage.text
      });
      
      // Restore the message to textbox since there was an error
      setInputMessage(userMessage.text);
      // Remove the user message from chat since it failed to process
      setMessages(prev => prev.slice(0, -1));
      setLastUserMessage(null);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingStatus(null);
      setStreamingData(null);
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

  // Optimize top row visibility check to reduce re-renders
  const shouldShowTopRow = useMemo(() => {
    const hasCompleteStreamingData = streamingData && streamingData.status === 'complete' && streamingData.data;
    const shouldShow = !!(currentApiResponse?.ideas || currentApiResponse?.detials || hasCompleteStreamingData);
    console.log('🎨 [UI] Top row visibility check:', {
      shouldShow,
      hasIdeas: !!currentApiResponse?.ideas,
      hasDetails: !!currentApiResponse?.detials,
      hasCompleteStreamingData: !!hasCompleteStreamingData,
      streamingDataStep: streamingData?.step,
      streamingDataStatus: streamingData?.status
    });
    return shouldShow;
  }, [currentApiResponse?.ideas, currentApiResponse?.detials, streamingData?.step, streamingData?.status, streamingData?.timestamp]);

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
            {/* Show streaming content: only quick_idea when complete, loading indicators otherwise */}
            {isStreaming && !currentApiResponse?.ideas ? (() => {
              // During streaming, only show quick_idea if available, otherwise show loading
              const quickIdeaStep = allStreamingSteps.current?.quick_idea as { data?: { hook?: string; angle?: string; description?: string } } | undefined;
              
              if (quickIdeaStep && quickIdeaStep.data) {
                // Show the quick_idea if it's completed
                return (
                  <div className="streaming-content">
                    <div className="quick-idea-data" style={{ padding: '20px' }}>
                      <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>💡 Quick Idea</h3>
                      {quickIdeaStep.data.hook && (
                        <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#0a0a0a', borderRadius: '8px', border: '1px solid #4CAF50' }}>
                          <h4 style={{ color: '#4CAF50', fontSize: '18px', margin: '0 0 8px 0' }}>Hook</h4>
                          <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>&ldquo;{quickIdeaStep.data.hook}&rdquo;</p>
                        </div>
                      )}
                      {quickIdeaStep.data.angle && (
                        <div style={{ marginBottom: '15px' }}>
                          <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Angle</h4>
                          <p style={{ color: '#e0e0e0', fontSize: '18px' }}>{quickIdeaStep.data.angle}</p>
                        </div>
                      )}
                      {quickIdeaStep.data.description && (
                        <div>
                          <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Description</h4>
                          <p style={{ color: '#e0e0e0', lineHeight: '1.5' }}>{quickIdeaStep.data.description}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Loading indicator for current step */}
                    <div style={{ padding: '20px', borderTop: '1px solid #333' }}>
                      <div className="streaming-progress">
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                          <div className="loading-spinner" style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #333',
                            borderTop: '2px solid #4CAF50',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginRight: '10px'
                          }}></div>
                          <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                            {streamingStatus || 'Processing...'}
                          </span>
                        </div>
                        <p style={{ color: '#999', fontSize: '14px' }}>
                          {(() => {
                            const status = streamingStatus || '';
                            if (status.includes('Researching trends') || status.includes('trends')) return 'Researching current trends and viral content to enhance your idea...';
                            if (status.includes('Researching examples') || status.includes('examples')) return 'Finding successful examples for inspiration...';
                            if (status.includes('Enhancing ideas') || status.includes('ideation')) return 'Generating enhanced creative concepts...';
                            if (status.includes('Selecting best') || status.includes('selection')) return 'Selecting the perfect approach for your brand...';
                            if (status.includes('Generating script') || status.includes('script')) return 'Crafting the perfect script...';
                            if (status.includes('Critiquing') || status.includes('critique')) return 'Reviewing and optimizing the content...';
                            if (status.includes('Packaging') || status.includes('packaging')) return 'Finalizing your content...';
                            return 'Refining this idea with trends and examples...';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Show loading state while waiting for quick_idea
                return (
                  <div className="streaming-loading" style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="loading-spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #333',
                      borderTop: '4px solid #4CAF50',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 20px auto'
                    }}></div>
                    <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>Generating Ideas...</h3>
                    <p style={{ color: '#999' }}>
                      {(() => {
                        const status = streamingStatus || '';
                        if (status.includes('Classifying intent') || status.includes('intent')) return 'Understanding your request and determining the best approach...';
                        if (status.includes('quick idea') || status.includes('quick')) return 'Creating your initial concept...';
                        if (status.includes('Starting content') || status.includes('Starting')) return 'Setting up content generation pipeline...';
                        return 'Analyzing your request and creating initial concepts...';
                      })()}
                    </p>
                  </div>
                );
              }
            })() : streamingData && streamingData.status === 'complete' && streamingData.data && !currentApiResponse?.ideas && (() => {
              console.log('🎨 [UI] Rendering completed streaming data:', streamingData);
              
              const renderDataUI = (data: Record<string, unknown>, step: string) => {
                switch (step) {
                  case 'intent':
                    return (
                      <div className="intent-data" style={{ padding: '20px' }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>📋 Intent Analysis</h3>
                        {data.format && (
                          <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Content Format</h4>
                            <p style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>{data.format as string}</p>
                          </div>
                        )}
                        {data.rationale && (
                          <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Reasoning</h4>
                            <p style={{ color: '#e0e0e0', lineHeight: '1.5' }}>{data.rationale as string}</p>
                          </div>
                        )}
                        {data.clarifying_questions && Array.isArray(data.clarifying_questions) && data.clarifying_questions.length > 0 && (
                          <div>
                            <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Clarifying Questions</h4>
                            <ul style={{ color: '#e0e0e0', paddingLeft: '20px' }}>
                              {data.clarifying_questions.map((q: string, i: number) => (
                                <li key={i} style={{ marginBottom: '8px' }}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  
                  case 'quick_idea':
                    return (
                      <div className="quick-idea-data" style={{ padding: '20px' }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>💡 Quick Idea</h3>
                        {data.hook && (
                          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#0a0a0a', borderRadius: '8px', border: '1px solid #4CAF50' }}>
                            <h4 style={{ color: '#4CAF50', fontSize: '18px', margin: '0 0 8px 0' }}>Hook</h4>
                            <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>&ldquo;{data.hook as string}&rdquo;</p>
                          </div>
                        )}
                        {data.angle && (
                          <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Angle</h4>
                            <p style={{ color: '#e0e0e0', fontSize: '18px' }}>{data.angle as string}</p>
                          </div>
                        )}
                        {data.description && (
                          <div>
                            <h4 style={{ color: '#f0f0f0', fontSize: '16px' }}>Description</h4>
                            <p style={{ color: '#e0e0e0', lineHeight: '1.5' }}>{data.description as string}</p>
                          </div>
                        )}
                      </div>
                    );
                  
                  case 'trends':
                    return (
                      <div className="trends-data" style={{ padding: '20px' }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>📈 Current Trends</h3>
                        {Array.isArray(data) && data.map((trend: unknown, i: number) => (
                          <div key={i} style={{ 
                            marginBottom: '20px', 
                            padding: '15px', 
                            backgroundColor: '#1a1a1a', 
                            borderRadius: '8px',
                            border: '1px solid #333'
                          }}>
                            <h4 style={{ color: '#4CAF50', fontSize: '16px', margin: '0 0 8px 0' }}>{trend.title}</h4>
                            <p style={{ color: '#e0e0e0', margin: '0 0 10px 0', lineHeight: '1.4' }}>{trend.snippet}</p>
                            {trend.hooks && trend.hooks.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {trend.hooks.map((hook: string, j: number) => (
                                  <span key={j} style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#4CAF50',
                                    color: '#000',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {hook}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  
                  case 'ideation':
                    return (
                      <div className="ideation-data" style={{ padding: '20px' }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>💭 Enhanced Ideas</h3>
                        {Array.isArray(data) && data.map((idea: unknown, i: number) => (
                          <div key={i} style={{ 
                            marginBottom: '20px', 
                            padding: '15px', 
                            backgroundColor: '#1a1a1a', 
                            borderRadius: '8px',
                            border: '1px solid #4CAF50'
                          }}>
                            <div style={{ marginBottom: '10px' }}>
                              <span style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' }}>{idea.angle}</span>
                            </div>
                            <h4 style={{ color: '#fff', fontSize: '18px', margin: '0 0 8px 0' }}>&ldquo;{idea.hook}&rdquo;</h4>
                            <p style={{ color: '#e0e0e0', margin: 0, lineHeight: '1.4' }}>{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    );
                  
                  default:
                    return (
                      <div className="generic-data" style={{ padding: '20px' }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>📊 {step.toUpperCase()} Results</h3>
                        <div style={{ 
                          backgroundColor: '#1a1a1a', 
                          padding: '15px', 
                          borderRadius: '8px',
                          border: '1px solid #333'
                        }}>
                          <pre style={{ 
                            color: '#e0e0e0', 
                            fontSize: '12px',
                            margin: 0,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                }
              };

              return (
                <div className="streaming-data-content">
                  {renderDataUI(streamingData.data, streamingData.step)}
                </div>
              );
            })()}
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
            ) : !(streamingData && streamingData.status === 'complete' && streamingData.data) ? (
              <div className="empty-content" style={{ color: '#666' }}>Selected idea and deliverables will appear here after you send a message</div>
            ) : null}
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
            {/* Show streaming status in details pane */}
            {streamingData && !currentApiResponse?.detials && (() => {
              console.log('🎨 [UI] Rendering streaming details component:', streamingData);
              return (
              <div className="streaming-details" style={{
                padding: '20px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                border: streamingData.status === 'complete' ? '2px solid #4CAF50' : '2px solid #FF9800',
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  color: streamingData.status === 'complete' ? '#4CAF50' : '#FF9800', 
                  marginBottom: '15px' 
                }}>
                  {streamingData.status === 'complete' ? '✅ Step Complete' : '⚡ Processing'}
                </h4>
                <div style={{ color: '#f0f0f0', fontSize: '14px' }}>
                  <div>Current Step: <strong>{streamingData.step}</strong></div>
                  <div style={{ marginTop: '8px' }}>
                    Status: <strong>{streamingData.status === 'complete' ? 'Completed' : 'In Progress...'}</strong>
                  </div>
                </div>
                {streamingData.status === 'in_progress' && (
                  <div className="processing-animation" style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#FF9800',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s ease-in-out infinite both'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#FF9800',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#FF9800',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
                    }}></div>
                  </div>
                )}
                {streamingData.status === 'complete' && streamingData.data && (
                  <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa' }}>
                    ✅ Data available in left pane
                  </div>
                )}
              </div>
              );
            })()}
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
            ) : !streamingData ? (
              <div className="empty-content" style={{ color: '#666' }}>Analysis details and generated ideas will appear here after you send a message</div>
            ) : null}
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
            {isStreaming && (
              <button
                onClick={() => {
                  console.log('🛑 [CAMPAIGN-EXPLORER] Stop stream button clicked');
                  setIsStreaming(false);
                  setStreamingStatus(null);
                  disconnect();
                }}
                style={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff5252'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b6b'}
              >
                <span style={{ fontSize: '12px' }}>⏹</span>
                Stop Stream
              </button>
            )}
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
            <ConnectionStatus />
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
