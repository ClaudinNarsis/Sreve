import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  apiResponse?: Record<string, unknown>;
}

interface DbMessage {
  chatMessageId: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
  createdAt?: string;
  apiResponse?: Record<string, unknown>;
}

const CampaignExplorer: React.FC<CampaignExplorerProps> = ({ campaignId, onDataChange }) => {
  console.log('🎯 [CAMPAIGN-EXPLORER] Component rendered with campaignId:', campaignId);

  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your campaign assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to save chat messages to database
  const saveChatMessageToDatabase = async (campaignId: string, message: ChatMessage) => {
    console.log('💾 [DATABASE] Saving chat message to database:', message);

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
        return false;
      }
    } catch (error) {
      console.error('💥 [DATABASE] Exception saving chat message:', error);
      return false;
    }
  };

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
          return {
            id: dbMsg.chatMessageId,
            text: dbMsg.message,
            sender: dbMsg.sender as 'user' | 'bot',
            timestamp: new Date(dbMsg.timestamp || dbMsg.createdAt),
            apiResponse: dbMsg.apiResponse
          };
        });

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
    if (campaignId) {
      console.log('💾 [API] About to save user message:', userMessage);
      saveChatMessageToDatabase(campaignId, userMessage).catch(error => {
        console.error('❌ [API] Failed to save user message:', error);
      });
    } else {
      console.log('⚠️ [API] No campaignId available, skipping user message save');
    }

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

  return (
    <div className="campaign-explorer-layout">
      {/* Chat Box - Full height for simplified interface */}
      <div
        className="chat-box"
        style={{
          height: '100%'
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