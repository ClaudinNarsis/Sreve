"use client";

import Link from "next/link";
import NextImage from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ProjectExplorer from "../components/ProjectExplorer";
import ProjectDetails from "../components/ProjectDetails";
import "../components/ProjectExplorer.css";
import { useAutoCreateUser } from "../hooks/useAutoCreateUser";

import "./app.css";
import React, { Suspense, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface UrlMetadata {
  title?: string;
  image?: string;
  description?: string;
  url: string;
}

interface ExampleWithMetadata {
  caption: string;
  url: string;
  metadata?: UrlMetadata;
  loading?: boolean;
  error?: boolean;
}

interface TrendData {
  trend_id: string;
  trend: string;
  status: string;
  platform: string;
  category: string;
  prompt: string;
  examples: Array<{
    caption: string;
    url: string;
  }>;
}

interface TrendApiResponse {
  chosen_trend: TrendData;
  reason: string;
  brand_goal_alignment?: string;
}

interface PostData {
  post_id: string;
  type: string;
  tags: string[];
  about: string;
  caption: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

interface AccountSummary {
  niche: string;
  content_style: string;
  posting_frequency: string;
  strengths: string[];
  weaknesses: string[];
}

interface SelectedAccount {
  handle: string;
  summary: AccountSummary;
  posts: PostData[];
  selection_reason: string;
}

interface AccountsApiResponse {
  selected_accounts: SelectedAccount[];
  overall_reasoning: string;
}

interface IdeaData {
  angle: string;
  hook: string;
  description: string;
}

interface SelectedIdea extends IdeaData {
  scores: {
    Attention: number;
    'Trend-Fit': number;
    Originality: number;
    'Brand-Fit': number;
  };
  rationale: string;
}

interface IdeaApiResponse {
  ideas: IdeaData[];
  selected_idea: SelectedIdea;
  reasoning: string;
}

interface CritiqueApiResponse {
  attention_score: number;
  relatability_score: number;
  originality_score: number;
  goal_alignment_score: number;
  overall_score: number;
  detailed_feedback: {
    attention: string;
    relatability: string;
    originality: string;
    goal_alignment: string;
  };
  follow_up_questions: string[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  messageType?: 'default' | 'question-session' | 'loading-trends' | 'loading-competitors' | 'loading-final-idea' | 'loading-accounts' | 'loading-critique' | 'trend-preview' | 'accounts-preview' | 'idea-preview' | 'critique-preview';
  questionMetadata?: {
    currentQuestionIndex: number;
    totalQuestions: number;
  };
  trendData?: TrendData;
  trendApiResponse?: TrendApiResponse;
  accountsData?: AccountsApiResponse;
  ideaData?: IdeaApiResponse;
  critiqueData?: CritiqueApiResponse;
}

interface Project {
  projectId: string;
  userId: string;
  brand_name: string;
  offering: string;
  usp: string;
  icp: string;
  brand_voice: string;
  competitors: string;
  additional_information: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

// ExampleCards component for displaying trend examples with metadata
interface ExampleCardsProps {
  examples: Array<{ caption: string; url: string; }>;
  exampleMetadata: Record<string, ExampleWithMetadata>;
  onFetchMetadata: (examples: Array<{ caption: string; url: string; }>) => void;
}

function ExampleCards({ examples, exampleMetadata, onFetchMetadata }: ExampleCardsProps) {
  useEffect(() => {
    // Fetch metadata when examples change
    if (examples && examples.length > 0) {
      onFetchMetadata(examples);
    }
  }, [examples, onFetchMetadata]); // Include examples but we've fixed the infinite loop with stable callback

  return (
    <div className="trend-examples">
      <h4 className="trend-examples-title">Examples:</h4>
      <div className="trend-examples-scroll">
        {examples.map((example, index) => {
          const metadata = exampleMetadata[example.url];
          const isLoading = metadata?.loading ?? false;
          const metaData = metadata?.metadata;

          return (
            <div
              key={index}
              className="trend-example-card"
              onClick={() => window.open(example.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')}
            >
              {/* Image section */}
              <div className="trend-example-image-container">
                {isLoading ? (
                  <div className="trend-example-loading">
                    <div className="loading-spinner"></div>
                  </div>
                ) : metaData?.image ? (
                  <img
                    src={metaData.image}
                    alt={metaData.title || example.caption}
                    className="trend-example-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="trend-example-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                      <path d="M13.96 12.17L11.06 14.38L9.23 12.17L5.5 17H18.5L13.96 12.17Z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Content section */}
              <div className="trend-example-content">
                {metaData?.title && (
                  <div className="trend-example-title">
                    {metaData.title}
                  </div>
                )}

                <div className="trend-example-caption">
                  {example.caption}
                </div>

                <div className="trend-example-url">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M13 3L16.293 6.293L6.293 16.293L3 13L13 3Z" fill="currentColor"/>
                    <path d="M19 14V19C19 20.1 18.1 21 17 21H5C3.9 21 3 20.1 3 19V7C3 5.9 3.9 5 5 5H10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  View Example
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useUser();

  useAutoCreateUser();

  // State management
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you create amazing marketing content today?',
      sender: 'bot',
      messageType: 'default',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Sequential flow error handling state
  const [sequenceError, setSequenceError] = useState<{
    hasError: boolean;
    errorMessage: string;
    failedStep: string;
    brandDetails?: Record<string, unknown>;
    campaignId?: string;
  }>({
    hasError: false,
    errorMessage: '',
    failedStep: '',
    brandDetails: undefined,
    campaignId: undefined
  });
  const [isRetryingSequence, setIsRetryingSequence] = useState(false);

  // State for storing example metadata
  const [exampleMetadata, setExampleMetadata] = useState<Record<string, ExampleWithMetadata>>({});

  // Function to fetch URL metadata
  const fetchUrlMetadata = async (url: string): Promise<UrlMetadata | null> => {
    try {
      console.log(`🔍 Fetching metadata for: ${url}`);

      const response = await fetch('/api/url-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        console.warn(`❌ Failed to fetch metadata for ${url}:`, response.status);
        return null;
      }

      const metadata = await response.json();
      console.log(`✅ Successfully fetched metadata for ${url}:`, metadata);
      return metadata;
    } catch (error) {
      console.error(`❌ Error fetching metadata for ${url}:`, error);
      return null;
    }
  };

  // Retry sequence function - defined as regular function to avoid circular dependency
  const retrySequence = async () => {
    console.log('🔄 [RETRY] Retrying sequential flow from the beginning');

    if (!sequenceError.brandDetails || !sequenceError.campaignId) {
      console.error('❌ [RETRY] Missing brandDetails or campaignId for retry');
      return;
    }

    setIsRetryingSequence(true);

    // Store current error data before clearing
    const retryBrandDetails = sequenceError.brandDetails;
    const retryCampaignId = sequenceError.campaignId;

    // Clear the error state
    setSequenceError({
      hasError: false,
      errorMessage: '',
      failedStep: '',
      brandDetails: undefined,
      campaignId: undefined
    });

    // Clear any loading messages from previous failed attempt
    setMessages(prev => prev.filter(msg => !msg.messageType?.startsWith('loading-')));

    try {
      // Restart the sequence from the beginning (trends step)
      await handleSequentialFlow('trends', retryBrandDetails, retryCampaignId);
    } catch (error) {
      console.error('❌ [RETRY] Failed to retry sequence:', error);
    } finally {
      setIsRetryingSequence(false);
    }
  };

  // Sequential flow handler for trends -> accounts -> ideas -> critique
  const handleSequentialFlow = useCallback(async (step: string, brandDetails: Record<string, unknown>, campaignId: string) => {
    const flowStartTime = Date.now();
    console.log('🚀 [SEQUENTIAL-FLOW] Starting sequential flow:', { step, campaignId, brandName: brandDetails.brand_name });

    let trendData = null;
    let accountsData = null;

    try {
      // Step 1: Trends Analysis
      if (step === 'trends') {
        console.log('📈 [SEQUENTIAL-FLOW] Step 1/3: Starting trends analysis');

        // Show loading message immediately in frontend
        const trendsLoadingMessage: ChatMessage = {
          id: `trends-loading-${Date.now()}`,
          text: 'Analyzing current market trends for your brand...',
          sender: 'bot',
          messageType: 'loading-trends',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, trendsLoadingMessage]);

        const trendsStartTime = Date.now();

        const trendsResponse = await fetch('/api/chat/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            brandDetails
          })
        });

        const trendsResult = await trendsResponse.json();
        const trendsDuration = Date.now() - trendsStartTime;
        console.log(`📈 [SEQUENTIAL-FLOW] Trends API completed in ${trendsDuration}ms:`, {
          status: trendsResponse.status,
          success: trendsResult.success,
          hasTrendData: !!trendsResult.trendData,
          loadingMessageId: trendsResult.loadingBotMessageId
        });

        // Check for HTTP error status or API error response
        if (!trendsResponse.ok || !trendsResult.success) {
          const errorMessage = trendsResult.error?.message || `Trends API failed with status: ${trendsResponse.status}`;
          throw new Error(errorMessage);
        }

        if (trendsResult.success) {
          // Replace loading message or add new result message
          if (trendsResult.trendData) {
            trendData = trendsResult.trendData;
            const trendMessage: ChatMessage = {
              id: trendsResult.trendBotMessageId,
              text: trendsResult.trendMessage,
              sender: 'bot',
              messageType: 'trend-preview',
              timestamp: new Date(),
              trendData: trendData.chosen_trend || trendData,
              trendApiResponse: trendData.chosen_trend ? trendData : undefined
            };

            // Replace the frontend loading message with results
            setMessages(prev => {
              const loadingIndex = prev.findIndex(msg =>
                msg.messageType === 'loading-trends' && msg.sender === 'bot'
              );

              if (loadingIndex !== -1) {
                console.log('🔄 [SEQUENTIAL-FLOW] Replacing trends loading message with results');
                const updated = [...prev];
                updated[loadingIndex] = trendMessage;
                return updated;
              } else {
                console.log('➕ [SEQUENTIAL-FLOW] Adding new trends message');
                return [...prev, trendMessage];
              }
            });
          } else if (trendsResult.noTrendBotMessageId) {
            // Handle no trends case
            const noTrendMessage: ChatMessage = {
              id: trendsResult.noTrendBotMessageId,
              text: trendsResult.noTrendMessage,
              sender: 'bot',
              messageType: 'default',
              timestamp: new Date()
            };

            setMessages(prev => {
              const loadingIndex = prev.findIndex(msg =>
                msg.messageType === 'loading-trends' && msg.sender === 'bot'
              );

              if (loadingIndex !== -1) {
                console.log('🔄 [SEQUENTIAL-FLOW] Replacing trends loading with no-trend message');
                const updated = [...prev];
                updated[loadingIndex] = noTrendMessage;
                return updated;
              } else {
                return [...prev, noTrendMessage];
              }
            });
          }

          // Step 2: Accounts Analysis
          console.log('🔍 [SEQUENTIAL-FLOW] Step 2/3: Starting accounts analysis');

          // Show loading message immediately in frontend
          const accountsLoadingMessage: ChatMessage = {
            id: `accounts-loading-${Date.now()}`,
            text: 'Finding successful competitor accounts that align with your brand strategy...',
            sender: 'bot',
            messageType: 'loading-accounts',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, accountsLoadingMessage]);

          const accountsStartTime = Date.now();

          const accountsResponse = await fetch('/api/chat/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              brandDetails
            })
          });

          const accountsResult = await accountsResponse.json();
          const accountsDuration = Date.now() - accountsStartTime;
          console.log(`🔍 [SEQUENTIAL-FLOW] Accounts API completed in ${accountsDuration}ms:`, {
            status: accountsResponse.status,
            success: accountsResult.success,
            hasAccountsData: !!accountsResult.accountsData,
            loadingMessageId: accountsResult.loadingBotMessageId
          });

          // Check for HTTP error status or API error response
          if (!accountsResponse.ok || !accountsResult.success) {
            const errorMessage = accountsResult.error?.message || `Accounts API failed with status: ${accountsResponse.status}`;
            throw new Error(errorMessage);
          }

          if (accountsResult.success) {
            // Replace loading message or add new result message
            if (accountsResult.accountsData) {
              accountsData = accountsResult.accountsData;
              const accountsMessage: ChatMessage = {
                id: accountsResult.accountsBotMessageId,
                text: accountsResult.accountsMessage,
                sender: 'bot',
                messageType: 'accounts-preview',
                timestamp: new Date(),
                accountsData: accountsData
              };

              setMessages(prev => {
                const loadingIndex = prev.findIndex(msg =>
                  msg.messageType === 'loading-accounts' && msg.sender === 'bot'
                );

                if (loadingIndex !== -1) {
                  console.log('🔄 [SEQUENTIAL-FLOW] Replacing accounts loading message with results');
                  const updated = [...prev];
                  updated[loadingIndex] = accountsMessage;
                  return updated;
                } else {
                  console.log('➕ [SEQUENTIAL-FLOW] Adding new accounts message');
                  return [...prev, accountsMessage];
                }
              });
            } else if (accountsResult.noAccountsBotMessageId) {
              // Handle no accounts case
              const noAccountsMessage: ChatMessage = {
                id: accountsResult.noAccountsBotMessageId,
                text: accountsResult.noAccountsMessage,
                sender: 'bot',
                messageType: 'default',
                timestamp: new Date()
              };

              setMessages(prev => {
                const loadingIndex = prev.findIndex(msg =>
                  msg.messageType === 'loading-accounts' && msg.sender === 'bot'
                );

                if (loadingIndex !== -1) {
                  console.log('🔄 [SEQUENTIAL-FLOW] Replacing accounts loading with no-accounts message');
                  const updated = [...prev];
                  updated[loadingIndex] = noAccountsMessage;
                  return updated;
                } else {
                  return [...prev, noAccountsMessage];
                }
              });
            }

            // Step 3: Ideas Generation
            console.log('💡 [SEQUENTIAL-FLOW] Step 3/3: Starting ideas generation');

            // Show loading message immediately in frontend
            const ideasLoadingMessage: ChatMessage = {
              id: `ideas-loading-${Date.now()}`,
              text: 'Generating creative content ideas based on the trends and competitor insights...',
              sender: 'bot',
              messageType: 'loading-final-idea',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, ideasLoadingMessage]);

            const ideasStartTime = Date.now();

            const ideasResponse = await fetch('/api/chat/ideas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                campaignId,
                brandDetails,
                selectedAccounts: accountsData?.selected_accounts || [],
                selectedTrends: trendData?.chosen_trend ? [trendData.chosen_trend] : []
              })
            });

            const ideasResult = await ideasResponse.json();
            const ideasDuration = Date.now() - ideasStartTime;
            console.log(`💡 [SEQUENTIAL-FLOW] Ideas API completed in ${ideasDuration}ms:`, {
              status: ideasResponse.status,
              success: ideasResult.success,
              hasIdeaData: !!ideasResult.ideaData,
              flowCompleted: ideasResult.flowCompleted,
              loadingMessageId: ideasResult.loadingBotMessageId
            });

            // Check for HTTP error status or API error response
            if (!ideasResponse.ok || !ideasResult.success) {
              const errorMessage = ideasResult.error?.message || `Ideas API failed with status: ${ideasResponse.status}`;
              throw new Error(errorMessage);
            }

            if (ideasResult.success) {
              // Replace loading message or add new result message
              if (ideasResult.ideaData) {
                const ideasMessage: ChatMessage = {
                  id: ideasResult.ideasBotMessageId,
                  text: ideasResult.ideasMessage,
                  sender: 'bot',
                  messageType: 'idea-preview',
                  timestamp: new Date(),
                  ideaData: ideasResult.ideaData
                };

                setMessages(prev => {
                  const loadingIndex = prev.findIndex(msg =>
                    msg.messageType === 'loading-final-idea' && msg.sender === 'bot'
                  );

                  if (loadingIndex !== -1) {
                    console.log('🔄 [SEQUENTIAL-FLOW] Replacing ideas loading message with results');
                    const updated = [...prev];
                    updated[loadingIndex] = ideasMessage;
                    return updated;
                  } else {
                    console.log('➕ [SEQUENTIAL-FLOW] Adding new ideas message');
                    return [...prev, ideasMessage];
                  }
                });
              } else if (ideasResult.noIdeasBotMessageId) {
                // Handle no ideas case
                const noIdeasMessage: ChatMessage = {
                  id: ideasResult.noIdeasBotMessageId,
                  text: ideasResult.noIdeasMessage,
                  sender: 'bot',
                  messageType: 'default',
                  timestamp: new Date()
                };

                setMessages(prev => {
                  const loadingIndex = prev.findIndex(msg =>
                    msg.messageType === 'loading-final-idea' && msg.sender === 'bot'
                  );

                  if (loadingIndex !== -1) {
                    console.log('🔄 [SEQUENTIAL-FLOW] Replacing ideas loading with completion message');
                    const updated = [...prev];
                    updated[loadingIndex] = noIdeasMessage;
                    return updated;
                  } else {
                    return [...prev, noIdeasMessage];
                  }
                });
              }

              // Check if we should proceed to critique step
              if (ideasResult.nextStep === 'critique') {
                // Step 4: Critique Analysis
                console.log('🎯 [SEQUENTIAL-FLOW] Step 4/4: Starting critique analysis');

                // Show loading message immediately in frontend
                const critiqueLoadingMessage: ChatMessage = {
                  id: `critique-loading-${Date.now()}`,
                  text: 'Analyzing and critiquing the generated idea against your requirements...',
                  sender: 'bot',
                  messageType: 'loading-critique',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, critiqueLoadingMessage]);

                // Extract idea string from ideaData for critique
                let ideaString = '';
                let userRequirement = '';

                if (ideasResult.ideaData?.selected_idea) {
                  ideaString = JSON.stringify(ideasResult.ideaData.selected_idea);
                } else if (ideasResult.ideaData?.ideas && ideasResult.ideaData.ideas.length > 0) {
                  ideaString = JSON.stringify(ideasResult.ideaData.ideas[0]);
                } else {
                  ideaString = 'Generated content idea for campaign analysis';
                }

                // Use brand details as user requirement context
                userRequirement = `Brand: ${brandDetails.brand_name}, Goal: ${brandDetails.goal}, Platform: ${brandDetails.platform}, Target: ${brandDetails.icp}`;

                const critiqueStartTime = Date.now();

                try {
                  const critiqueResponse = await fetch('/api/chat/critique', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      campaignId,
                      ideaString,
                      userRequirement
                    })
                  });

                  const critiqueResult = await critiqueResponse.json();
                  const critiqueDuration = Date.now() - critiqueStartTime;
                  console.log(`🎯 [SEQUENTIAL-FLOW] Critique API completed in ${critiqueDuration}ms:`, {
                    status: critiqueResponse.status,
                    success: critiqueResult.success,
                    hasCritiqueData: !!critiqueResult.critiqueData,
                    flowCompleted: critiqueResult.flowCompleted,
                    loadingMessageId: critiqueResult.loadingBotMessageId
                  });

                  // Check for HTTP error status or API error response
                  if (!critiqueResponse.ok || !critiqueResult.success) {
                    const errorMessage = critiqueResult.error?.message || `Critique API failed with status: ${critiqueResponse.status}`;
                    throw new Error(errorMessage);
                  }

                  if (critiqueResult.success) {
                    // Replace loading message with critique results
                    if (critiqueResult.critiqueData) {
                      const critiqueMessage: ChatMessage = {
                        id: critiqueResult.critiqueBotMessageId,
                        text: critiqueResult.critiqueMessage,
                        sender: 'bot',
                        messageType: 'critique-preview',
                        timestamp: new Date(),
                        critiqueData: critiqueResult.critiqueData
                      };

                      setMessages(prev => {
                        const loadingIndex = prev.findIndex(msg =>
                          msg.messageType === 'loading-critique' && msg.sender === 'bot'
                        );

                        if (loadingIndex !== -1) {
                          console.log('🔄 [SEQUENTIAL-FLOW] Replacing critique loading message with results');
                          const updated = [...prev];
                          updated[loadingIndex] = critiqueMessage;
                          return updated;
                        } else {
                          console.log('➕ [SEQUENTIAL-FLOW] Adding new critique message');
                          return [...prev, critiqueMessage];
                        }
                      });
                    } else if (critiqueResult.noCritiqueBotMessageId) {
                      // Handle no critique case
                      const noCritiqueMessage: ChatMessage = {
                        id: critiqueResult.noCritiqueBotMessageId,
                        text: critiqueResult.noCritiqueMessage,
                        sender: 'bot',
                        messageType: 'default',
                        timestamp: new Date()
                      };

                      setMessages(prev => {
                        const loadingIndex = prev.findIndex(msg =>
                          msg.messageType === 'loading-critique' && msg.sender === 'bot'
                        );

                        if (loadingIndex !== -1) {
                          console.log('🔄 [SEQUENTIAL-FLOW] Replacing critique loading with completion message');
                          const updated = [...prev];
                          updated[loadingIndex] = noCritiqueMessage;
                          return updated;
                        } else {
                          return [...prev, noCritiqueMessage];
                        }
                      });
                    }

                    const totalFlowDuration = Date.now() - flowStartTime;
                    console.log(`✅ [SEQUENTIAL-FLOW] All 4 steps completed successfully in ${totalFlowDuration}ms!`);
                  } else {
                    throw new Error(`Critique API failed: ${critiqueResult.message}`);
                  }
                } catch (error) {
                  console.error('❌ [SEQUENTIAL-FLOW] Critique step error:', error);

                  // Replace loading message with error message
                  const critiqueErrorMessage: ChatMessage = {
                    id: Date.now().toString(),
                    text: 'Your campaign strategy is complete! I\'ve generated comprehensive insights for your marketing campaign.',
                    sender: 'bot',
                    messageType: 'default',
                    timestamp: new Date()
                  };

                  setMessages(prev => {
                    const loadingIndex = prev.findIndex(msg =>
                      msg.messageType === 'loading-critique' && msg.sender === 'bot'
                    );

                    if (loadingIndex !== -1) {
                      const updated = [...prev];
                      updated[loadingIndex] = critiqueErrorMessage;
                      return updated;
                    } else {
                      return [...prev, critiqueErrorMessage];
                    }
                  });

                  const totalFlowDuration = Date.now() - flowStartTime;
                  console.log(`✅ [SEQUENTIAL-FLOW] Flow completed with critique error in ${totalFlowDuration}ms`);
                }
              } else {
                const totalFlowDuration = Date.now() - flowStartTime;
                console.log(`✅ [SEQUENTIAL-FLOW] All steps completed successfully in ${totalFlowDuration}ms!`);
              }
            } else {
              throw new Error(`Ideas API failed: ${ideasResult.message}`);
            }
          } else {
            throw new Error(`Accounts API failed: ${accountsResult.message}`);
          }
        } else {
          throw new Error(`Trends API failed: ${trendsResult.message}`);
        }
      }
    } catch (error) {
      const totalFlowDuration = Date.now() - flowStartTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ [SEQUENTIAL-FLOW] Error in sequential flow after ${totalFlowDuration}ms:`, {
        error: errorMsg,
        step,
        campaignId
      });

      // Clear any loading messages from the failed sequence
      setMessages(prev => prev.filter(msg => !msg.messageType?.startsWith('loading-')));

      // Set error state for retry functionality
      setSequenceError({
        hasError: true,
        errorMessage: `The ${step} analysis failed. Please try again.`,
        failedStep: step,
        brandDetails,
        campaignId
      });

      // Add error message to chat with retry button context
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `❌ The ${step} analysis encountered an error and the sequence was stopped. You can retry the entire sequence below.`,
        sender: 'bot',
        messageType: 'default',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [setSequenceError]);

  // Function to fetch metadata for all examples in a trend
  const fetchExampleMetadata = useCallback(async (examples: Array<{ caption: string; url: string; }>) => {
    for (const example of examples) {
      const key = example.url;

      // Set loading state
      setExampleMetadata(prev => {
        // Skip if we already have metadata for this URL
        if (prev[key] && (prev[key].metadata || prev[key].error)) {
          return prev;
        }

        return {
          ...prev,
          [key]: {
            caption: example.caption,
            url: example.url,
            loading: true,
            error: false
          }
        };
      });

      // Fetch metadata
      const metadata = await fetchUrlMetadata(example.url);

      // Update state with result
      setExampleMetadata(prev => ({
        ...prev,
        [key]: {
          caption: example.caption,
          url: example.url,
          metadata: metadata || undefined,
          loading: false,
          error: !metadata
        }
      }));
    }
  }, []); // Remove exampleMetadata from dependencies

  // Message loading state
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);



  // Message saving utility
  const saveMessageToDatabase = async (campaignId: string, message: ChatMessage) => {
    console.log('💾 Saving message to database:', { campaignId, message });

    try {
      const response = await fetch('/api/chat/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          message: {
            id: message.id,
            text: message.text,
            sender: message.sender,
            timestamp: message.timestamp.toISOString()
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log('✅ Message saved to database successfully');
        return true;
      } else {
        console.error('❌ Failed to save message:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving message to database:', error);
      return false;
    }
  };

  // Project and campaign creation utilities
  const createProject = async (initialPrompt: string) => {
    console.log('🔄 Creating project for prompt:', initialPrompt);

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_name: 'New Project',
        offering: '',
        usp: '',
        icp: '',
        brand_voice: '',
        competitors: '',
        additional_information: `Created from prompt: ${initialPrompt.substring(0, 200)}...`
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ Project created:', data.project);
      return data.project;
    } else {
      throw new Error(data.error || 'Failed to create project');
    }
  };

  const createCampaign = async (projectId: string, initialPrompt: string) => {
    console.log('🔄 Creating campaign for project:', projectId);

    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        name: 'New Campaign',
        description: `Auto-created campaign from: ${initialPrompt.substring(0, 100)}...`
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ Campaign created:', data.campaign);
      return data.campaign;
    } else {
      throw new Error(data.error || 'Failed to create campaign');
    }
  };

  // Fetch project data
  const fetchProjectData = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (response.ok && data.project) {
        setSelectedProject(data.project);
        console.log('✅ Project data fetched:', data.project);
      } else {
        console.error('Failed to fetch project data:', data.error || 'Project not found');
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  // Message sending logic with campaign validation
  const handleSendMessage = useCallback(async () => {
    console.log('🚀 handleSendMessage called');

    if (!inputMessage.trim()) {
      console.log('❌ Empty input message');
      return;
    }

    const messageText = inputMessage.trim();

    // Check if campaign is selected
    if (!selectedCampaignId) {
      console.log('📝 No campaign selected, starting project/campaign creation flow');
      setIsCreatingProject(true);

      try {
        toast.loading('Creating your project and campaign...', { id: 'creating' });

        // Create project
        const project = await createProject(messageText);
        setSelectedProjectId(project.projectId);

        // Create campaign
        const campaign = await createCampaign(project.projectId, messageText);
        setSelectedCampaignId(campaign.campaignId);

        // Store initial prompt for the campaign
        sessionStorage.setItem(`initialPrompt_${campaign.campaignId}`, messageText);
        sessionStorage.setItem(`initialPrompt_${campaign.campaignId}_timestamp`, Date.now().toString());

        toast.success('Project and campaign created!', { id: 'creating' });

        // Add user message to chat
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          text: messageText,
          sender: 'user',
          messageType: 'default',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // Save user message to database
        await saveMessageToDatabase(campaign.campaignId, userMessage);

        // Add bot response
        setTimeout(async () => {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: `Great! I've created a new project and campaign for you. Let's start working on your content. What type of marketing content would you like me to help you create?`,
            sender: 'bot',
            messageType: 'default',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);

          // Save bot message to database
          await saveMessageToDatabase(campaign.campaignId, botMessage);
        }, 1000);

      } catch (error) {
        console.error('❌ Error in project/campaign creation:', error);
        toast.error('Failed to create project and campaign', { id: 'creating' });
      } finally {
        setIsCreatingProject(false);
      }
    } else {
      // Campaign is selected, proceed with robust message sending via chat API
      console.log('💬 Campaign selected, sending message to chat API:', selectedCampaignId);

      // Add user message to chat immediately for better UX
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        messageType: 'default',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Add temporary loading message that will be updated with the API response
      const tempLoadingMessage: ChatMessage = {
        id: 'temp-loading-' + Date.now().toString(),
        text: 'Processing your request...',
        sender: 'bot',
        messageType: 'loading-trends',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempLoadingMessage]);

      try {
        // Call the robust chat API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: selectedCampaignId,
            userMessage: messageText
          })
        });

        const data = await response.json();
        console.log('🔄 Chat API response:', data);

        if (response.ok && data.success) {
          // Determine message type based on response data
          const isQuestionSession = data.nextQuestion || data.firstQuestion || data.recovery || data.sessionRecovered;

          // Create main bot message
          const botMessage: ChatMessage = {
            id: data.botMessageId || (Date.now() + 1).toString(),
            text: data.botMessage || 'Message processed successfully.',
            sender: 'bot',
            messageType: isQuestionSession ? 'question-session' : 'default',
            timestamp: new Date(),
            questionMetadata: isQuestionSession && (data.currentQuestionIndex !== undefined || data.totalQuestions) ? {
              currentQuestionIndex: data.currentQuestionIndex !== undefined ? data.currentQuestionIndex + 1 : 1,
              totalQuestions: data.totalQuestions || 5
            } : undefined
          };

          // Replace temporary loading message with the main response
          setMessages(prev => {
            const tempLoadingIndex = prev.findIndex(msg =>
              msg.sender === 'bot' &&
              msg.id.startsWith('temp-loading-')
            );

            if (tempLoadingIndex !== -1) {
              // Replace the temporary loading message with the real response
              const updatedMessages = [...prev];
              updatedMessages[tempLoadingIndex] = botMessage;
              console.log(`🔄 Replaced temporary loading message with main response: ${botMessage.id}`);
              return updatedMessages;
            } else {
              // Add new message if no temp message found
              return [...prev, botMessage];
            }
          });

          // Check if we need to start sequential flow
          if (data.nextStep && data.brandDetails) {
            console.log('🚀 Starting sequential flow with step:', data.nextStep);
            await handleSequentialFlow(data.nextStep, data.brandDetails, selectedCampaignId);
          }

          // Handle special cases
          if (data.recovery) {
            console.log('🔄 Session recovery offered:', data.recovery);
          }
          if (data.questionsCompleted) {
            console.log('✅ All questions completed!');
          }
          if (data.nextQuestion) {
            console.log('❓ Next question available:', data.nextQuestion);
          }
        } else {
          console.error('❌ Chat API error:', data.error);

          // Create error message
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: data.error?.message || 'Sorry, there was an error processing your message. Please try again.',
            sender: 'bot',
            messageType: 'default',
            timestamp: new Date()
          };

          // Replace temporary loading message with error, or add new error message
          setMessages(prev => {
            const tempLoadingIndex = prev.findIndex(msg =>
              msg.sender === 'bot' &&
              msg.id.startsWith('temp-loading-') &&
              (msg.messageType === 'loading-trends' || msg.messageType === 'loading-competitors' || msg.messageType === 'loading-final-idea' || msg.messageType === 'loading-accounts')
            );

            if (tempLoadingIndex !== -1) {
              // Replace the temporary loading message with error
              const updatedMessages = [...prev];
              updatedMessages[tempLoadingIndex] = errorMessage;
              console.log('🔄 Replaced temporary loading message with error message');
              return updatedMessages;
            }

            // Add new error message if no temp message found
            return [...prev, errorMessage];
          });

          // Show retry guidance if available
          if (data.error?.retryable) {
            const retryAfter = data.error.retryAfter || 30;
            toast.error(`Service temporarily unavailable. Please try again in ${retryAfter} seconds.`);
          }
        }
      } catch (error) {
        console.error('❌ Network error calling chat API:', error);

        // Create network error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Network error occurred. Please check your connection and try again.',
          sender: 'bot',
          messageType: 'default',
          timestamp: new Date()
        };

        // Replace temporary loading message with error, or add new error message
        setMessages(prev => {
          const tempLoadingIndex = prev.findIndex(msg =>
            msg.sender === 'bot' &&
            msg.id.startsWith('temp-loading-') &&
            (msg.messageType === 'loading-trends' || msg.messageType === 'loading-competitors' || msg.messageType === 'loading-final-idea' || msg.messageType === 'loading-accounts')
          );

          if (tempLoadingIndex !== -1) {
            // Replace the temporary loading message with error
            const updatedMessages = [...prev];
            updatedMessages[tempLoadingIndex] = errorMessage;
            console.log('🔄 Replaced temporary loading message with network error message');
            return updatedMessages;
          }

          // Add new error message if no temp message found
          return [...prev, errorMessage];
        });

        toast.error('Network error. Please try again.');
      }
    }
  }, [inputMessage, selectedCampaignId, handleSequentialFlow]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load existing chat messages when campaign is selected
  const loadChatMessages = useCallback(async (campaignId: string) => {
    // Prevent concurrent loading calls
    if (isLoadingMessages) {
      console.log('📥 Already loading messages, skipping duplicate request');
      return;
    }

    console.log('📥 Loading chat messages for campaign:', campaignId);
    setIsLoadingMessages(true);

    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat?campaignId=${campaignId}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();
      console.log('📥 Chat API response:', data);

      if (response.ok && data.success) {
        // Convert database messages to ChatMessage format
        const dbMessages = data.messages || [];
        console.log('📋 Raw DB messages:', dbMessages);

        const chatMessages: ChatMessage[] = dbMessages.map((dbMsg: {
          chatMessageId: string;
          message: string;
          sender: string;
          messageType?: string;
          timestamp?: string;
          createdAt: string;
          trendData?: TrendData | TrendApiResponse;
          accountsData?: AccountsApiResponse;
          ideaData?: IdeaApiResponse;
          critiqueData?: CritiqueApiResponse;
        }) => {
          // Extract question metadata from message text if it's a question session
          let questionMetadata: { currentQuestionIndex: number; totalQuestions: number; } | undefined;
          if (dbMsg.messageType === 'question-session' && dbMsg.sender === 'bot') {
            const questionMatch = dbMsg.message.match(/Question (\d+) of (\d+):/);
            if (questionMatch) {
              questionMetadata = {
                currentQuestionIndex: parseInt(questionMatch[1]),
                totalQuestions: parseInt(questionMatch[2])
              };
            }
          }

          // Handle both old format (TrendData) and new format (TrendApiResponse)
          let trendData: TrendData | undefined;
          let trendApiResponse: TrendApiResponse | undefined;

          if (dbMsg.trendData) {
            console.log('🔍 [DEBUG] Processing DB message with trendData:', JSON.stringify(dbMsg.trendData, null, 2));

            // Check if it's the new API response format (has chosen_trend property)
            if ('chosen_trend' in dbMsg.trendData) {
              trendApiResponse = dbMsg.trendData as TrendApiResponse;
              trendData = trendApiResponse.chosen_trend;
              console.log('🔍 [DEBUG] New format detected - extracted chosen_trend:', JSON.stringify(trendData, null, 2));
              console.log('🔍 [DEBUG] Reason from API response:', trendApiResponse.reason);
            } else {
              // Old format - direct TrendData
              trendData = dbMsg.trendData as TrendData;
              console.log('🔍 [DEBUG] Old format detected - direct TrendData:', JSON.stringify(trendData, null, 2));
            }
          }

          // Handle accounts data
          let accountsData: AccountsApiResponse | undefined;
          if (dbMsg.accountsData) {
            console.log('🔍 [DEBUG] Processing DB message with accountsData:', JSON.stringify(dbMsg.accountsData, null, 2));
            accountsData = dbMsg.accountsData as AccountsApiResponse;
          }

          // Handle idea data
          let ideaData: IdeaApiResponse | undefined;
          if (dbMsg.ideaData) {
            console.log('🔍 [DEBUG] Processing DB message with ideaData:', JSON.stringify(dbMsg.ideaData, null, 2));
            ideaData = dbMsg.ideaData as IdeaApiResponse;
          }

          // Handle critique data
          let critiqueData: CritiqueApiResponse | undefined;
          if (dbMsg.critiqueData) {
            console.log('🔍 [DEBUG] Processing DB message with critiqueData:', JSON.stringify(dbMsg.critiqueData, null, 2));
            critiqueData = dbMsg.critiqueData as CritiqueApiResponse;
          }

          return {
            id: dbMsg.chatMessageId,
            text: dbMsg.message,
            sender: dbMsg.sender as 'user' | 'bot',
            messageType: (dbMsg.messageType as 'default' | 'question-session' | 'loading-trends' | 'loading-competitors' | 'loading-final-idea' | 'loading-accounts' | 'loading-critique' | 'trend-preview' | 'accounts-preview' | 'idea-preview' | 'critique-preview') || 'default',
            timestamp: new Date(dbMsg.timestamp || dbMsg.createdAt),
            questionMetadata,
            trendData,
            trendApiResponse,
            accountsData,
            ideaData,
            critiqueData
          };
        });

        // Add welcome message if no messages exist
        if (chatMessages.length === 0) {
          chatMessages.unshift({
            id: '1',
            text: 'Hello! I\'m your AI assistant. How can I help you create amazing marketing content today?',
            sender: 'bot',
            messageType: 'default',
            timestamp: new Date()
          });
        }

        setMessages(chatMessages);
        console.log('✅ Loaded', chatMessages.length, 'chat messages');
      } else {
        console.error('❌ Failed to load chat messages:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load messages when campaign changes
  useEffect(() => {
    console.log('🔄 Campaign selection changed:', selectedCampaignId);

    if (selectedCampaignId) {
      console.log('✅ Loading messages for campaign:', selectedCampaignId);
      loadChatMessages(selectedCampaignId);
    } else {
      console.log('📝 No campaign selected, showing default message');
      // Reset to default welcome message when no campaign selected
      setMessages([{
        id: '1',
        text: 'Hello! I\'m your AI assistant. How can I help you create amazing marketing content today?',
        sender: 'bot',
        messageType: 'default',
        timestamp: new Date()
      }]);
    }
  }, [selectedCampaignId, loadChatMessages]);


  // Fetch project data when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectData(selectedProjectId);
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId]);

  // Handle pending prompts on app page load
  useEffect(() => {
    if (!user) return;

    const checkPendingPrompt = () => {
      const pendingPrompt = sessionStorage.getItem('pendingPrompt');
      const pendingTimestamp = sessionStorage.getItem('pendingPromptTimestamp');

      console.log('🔍 Checking for pending prompt on app load:', {
        hasPendingPrompt: !!pendingPrompt,
        pendingPrompt,
        timestamp: pendingTimestamp
      });

      if (pendingPrompt && pendingTimestamp) {
        // Check if prompt is still fresh (5 minutes)
        const timestamp = parseInt(pendingTimestamp);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        if (timestamp > fiveMinutesAgo) {
          console.log('✅ Fresh pending prompt found, processing automatically');

          // Set the input message and trigger send
          setInputMessage(pendingPrompt);

          // Clear the pending prompt
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');

          // Trigger the message send flow after a short delay
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        } else {
          console.log('⏰ Pending prompt expired, clearing');
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');
        }
      }
    };

    // Check for pending prompt after component mounts
    const timer = setTimeout(checkPendingPrompt, 1000);
    return () => clearTimeout(timer);
  }, [user, handleSendMessage]);

  // Helper function to render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    const messageType = message.messageType || 'default';

    if (messageType === 'question-session' && message.sender === 'bot') {
      return (
        <div className="message-content">
          <div className="question-header">

            <h3 className="question-title">
              {message.questionMetadata
                ? `Question ${message.questionMetadata.currentQuestionIndex} out of ${message.questionMetadata.totalQuestions}`
                : 'Question Session'
              }
            </h3>
          </div>
          <div className="question-text">
            {message.text.replace(/^.*?Question \d+ of \d+:\s*/, '')}
          </div>
        </div>
      );
    }

    // Loading message types
    if (messageType === 'loading-trends' || messageType === 'loading-competitors' || messageType === 'loading-final-idea' || messageType === 'loading-accounts') {
      const loadingConfig = {
        'loading-trends': {
          gif: '/assets/loading/trends-loading.gif',
          text: 'Analyzing market trends...'
        },
        'loading-competitors': {
          gif: '/assets/loading/competitors-loading.gif',
          text: 'Researching competitors...'
        },
        'loading-final-idea': {
          gif: '/assets/loading/final-idea-loading.gif',
          text: 'Generating final ideas...'
        },
        'loading-accounts': {
          gif: '/assets/loading/accounts-loading.gif',
          text: 'Finding successful competitor accounts...'
        }
      };

      const config = loadingConfig[messageType];

      return (
        <div className="message-content loading-message">
          <div className="loading-gif-container">
            <NextImage
              src={config.gif}
              alt={`Loading ${messageType.replace('loading-', '')}`}
              width={48}
              height={48}
              className="loading-gif"
              priority
            />
          </div>
          <div className="loading-text">
            {config.text}
          </div>
        </div>
      );
    }

    // Trend preview message type
    if (messageType === 'trend-preview' && message.sender === 'bot' && (message.trendData || message.trendApiResponse)) {
      const trend = message.trendApiResponse?.chosen_trend || message.trendData;
      const reason = message.trendApiResponse?.reason;

      // Debug logging for trend preview rendering
      console.log('🔍 [DEBUG] Rendering trend preview message:');
      console.log('🔍 [DEBUG] message.trendData:', JSON.stringify(message.trendData, null, 2));
      console.log('🔍 [DEBUG] message.trendApiResponse:', JSON.stringify(message.trendApiResponse, null, 2));
      console.log('🔍 [DEBUG] extracted trend:', JSON.stringify(trend, null, 2));
      console.log('🔍 [DEBUG] extracted reason:', reason);
      console.log('🔍 [DEBUG] reason truthy?', !!reason);

      // Status icon mapping
      const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
          case 'rising':
            return (
              <span className="trend-status-icon rising">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
                </svg>
              </span>
            );
          case 'trending':
            return (
              <span className="trend-status-icon trending">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13.5.67S10.25 3.88 10.25 8.25C10.25 12.5 13.5 15.75 13.5 15.75S16.75 12.5 16.75 8.25C16.75 3.88 13.5.67 13.5.67ZM13.5 11.25C12.25 11.25 11.25 10.25 11.25 9S12.25 6.75 13.5 6.75 15.75 7.75 15.75 9 14.75 11.25 13.5 11.25ZM7 14C7.01 17.73 8.78 21.08 11.65 23H4C2.9 23 2 22.1 2 21V17C2 15.9 2.9 15 4 15H7V14Z" fill="currentColor"/>
                </svg>
              </span>
            );
          case 'stable':
            return (
              <span className="trend-status-icon stable">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 21H2V19H4V3H6V19H10V9H12V19H16V6H18V19H20V21Z" fill="currentColor"/>
                </svg>
              </span>
            );
          case 'declining':
            return (
              <span className="trend-status-icon declining">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 18L18.29 15.71L13.41 10.83L9.41 14.83L2 7.41L3.41 6L9.41 12L13.41 8L19.71 14.29L22 12V18H16Z" fill="currentColor"/>
                </svg>
              </span>
            );
          default:
            return (
              <span className="trend-status-icon default">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </span>
            );
        }
      };

      return (
        <div className="message-content trend-preview">
          <div className="trend-intro">
            {message.text}
          </div>

          <div className="trend-header">
            <h3 className="trend-title">{trend.trend}</h3>
            {getStatusIcon(trend.status)}
          </div>

          

          <p className="trend-prompt">{trend.prompt}</p>
          
          {trend.examples && trend.examples.length > 0 && (
            <ExampleCards
              examples={trend.examples}
              exampleMetadata={exampleMetadata}
              onFetchMetadata={fetchExampleMetadata}
            />
          )}

          {reason && (
            <p className="trend-reason">
              {(() => {
                console.log('🔍 [DEBUG] Rendering reason paragraph with text:', reason);
                return reason;
              })()}
            </p>
          )}
          {!reason && (() => {
            console.log('🔍 [DEBUG] Reason is falsy, not rendering reason paragraph');
            return null;
          })()}
        </div>
      );
    }

    // Accounts preview message type
    if (messageType === 'accounts-preview' && message.sender === 'bot' && message.accountsData) {
      const accountsData = message.accountsData;

      // Helper function to format engagement numbers
      const formatEngagement = (num: number): string => {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
      };

      return (
        <div className="message-content accounts-preview">
          <div className="accounts-intro">
            {message.text}
          </div>

          <div className="accounts-overview">
            {Array.isArray(accountsData.selected_accounts) ? accountsData.selected_accounts.map((account, index) => (
              <div key={index} className="account-card">
                <div className="account-header">
                  <div className="account-avatar">
                    <div className="account-placeholder-avatar">
                      {(account.handle || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="account-info">
                    <h3 className="account-username">{account.handle || 'Unknown Account'}</h3>
                    <p className="account-handle">@{account.handle?.toLowerCase() || 'unknown'}</p>
                  </div>
                </div>

                <div className="account-stats">
                  <div className="stat-item">
                    <p className="stat-value">{account.summary?.niche || 'General'}</p>
                    <p className="stat-label">Niche</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{account.summary?.content_style || 'Mixed'}</p>
                    <p className="stat-label">Style</p>
                  </div>
                </div>

                {(Array.isArray(account.summary?.strengths) && account.summary.strengths.length > 0) ||
                 (Array.isArray(account.summary?.weaknesses) && account.summary.weaknesses.length > 0) ? (
                  <div className="account-summary">
                    {Array.isArray(account.summary?.strengths) && account.summary.strengths.length > 0 && (
                      <div className="summary-section">
                        <h4 className="summary-title">Strengths</h4>
                        <ul className="summary-list">
                          {account.summary.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(account.summary?.weaknesses) && account.summary.weaknesses.length > 0 && (
                      <div className="summary-section">
                        <h4 className="summary-title">Weaknesses</h4>
                        <ul className="summary-list">
                          {account.summary.weaknesses.map((weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="recent-posts">
                  <h4 className="recent-posts-title">Recent Posts</h4>
                  <div className="posts-grid">
                    {Array.isArray(account.posts) ? account.posts.map((post, postIdx) => (
                      <div key={postIdx} className="post-card">
                        <div className="post-header">
                          <span className="post-platform">{post.type || 'Social'}</span>
                          <span className="post-date">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="post-content">
                          {post.caption || post.about || 'No content available'}
                        </div>
                        <div className="post-engagement">
                          <div className="engagement-item">
                            <span className="engagement-icon">❤️</span>
                            <span className="engagement-value">{formatEngagement(post.engagement?.likes || 0)}</span>
                          </div>
                          <div className="engagement-item">
                            <span className="engagement-icon">💬</span>
                            <span className="engagement-value">{formatEngagement(post.engagement?.comments || 0)}</span>
                          </div>
                          <div className="engagement-item">
                            <span className="engagement-icon">🔄</span>
                            <span className="engagement-value">{formatEngagement(post.engagement?.shares || 0)}</span>
                          </div>
                          <div className="engagement-item">
                            <span className="engagement-icon">🔖</span>
                            <span className="engagement-value">{formatEngagement(post.engagement?.saves || 0)}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="no-posts">No posts available</div>
                    )}
                  </div>
                </div>

                <div className="selection-reasoning">
                  <h4 className="reasoning-title">Selection Reasoning</h4>
                  <p className="reasoning-content">{account.selection_reason || 'No reasoning provided'}</p>
                </div>
              </div>
            )) : (
              <div className="no-accounts">No accounts available</div>
            )}
          </div>

          {accountsData.overall_reasoning && (
            <div className="overall-reasoning">
              <h4 className="reasoning-title">Overall Strategy:</h4>
              <p className="reasoning-content">{accountsData.overall_reasoning}</p>
            </div>
          )}
        </div>
      );
    }

    // Idea preview message type
    if (messageType === 'idea-preview' && message.sender === 'bot' && message.ideaData) {
      const ideaData = message.ideaData;

      // Helper function to render score bars
      const renderScoreBar = (score: number, label: string) => {
        const percentage = (score / 10) * 100; // Assuming scores are out of 10
        const getScoreColor = (score: number) => {
          if (score >= 8) return '#4CAF50'; // Green
          if (score >= 6) return '#FF9800'; // Orange
          return '#f44336'; // Red
        };

        return (
          <div key={label} className="score-item">
            <div className="score-label">{label}</div>
            <div className="score-bar-container">
              <div
                className="score-bar-fill"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: getScoreColor(score)
                }}
              ></div>
            </div>
            <div className="score-value">{score}/10</div>
          </div>
        );
      };

      return (
        <div className="message-content idea-preview">
          <div className="idea-intro">
            {message.text}
          </div>

          {/* All Generated Ideas */}
          <div className="all-ideas-section">
            <h3 className="section-title">Generated Ideas</h3>
            <div className="ideas-grid">
              {Array.isArray(ideaData.ideas) ? ideaData.ideas.map((idea, index) => (
                <div key={index} className="idea-card">
                  <div className="idea-header">
                    <h4 className="idea-angle">{idea.angle}</h4>
                  </div>
                  <div className="idea-hook">
                    <strong>Hook:</strong> "{idea.hook}"
                  </div>
                  <div className="idea-description">
                    {idea.description}
                  </div>
                </div>
              )) : (
                <div className="no-ideas">No ideas available</div>
              )}
            </div>
          </div>

          {/* Selected Idea with Scores */}
          {ideaData.selected_idea && (
            <div className="selected-idea-section">
              <h3 className="section-title">🎯 Recommended Idea</h3>
              <div className="selected-idea-card">
                <div className="selected-idea-header">
                  <h4 className="selected-idea-angle">{ideaData.selected_idea.angle}</h4>
                  <div className="idea-badge">Top Pick</div>
                </div>

                <div className="selected-idea-hook">
                  <strong>Hook:</strong> "{ideaData.selected_idea.hook}"
                </div>

                <div className="selected-idea-description">
                  {ideaData.selected_idea.description}
                </div>

                {/* Scoring Section */}
                {ideaData.selected_idea.scores && (
                  <div className="idea-scores">
                    <h5 className="scores-title">Performance Scores</h5>
                    <div className="scores-grid">
                      {Object.entries(ideaData.selected_idea.scores).map(([key, value]) =>
                        renderScoreBar(value, key)
                      )}
                    </div>
                  </div>
                )}

                {/* Rationale */}
                {ideaData.selected_idea.rationale && (
                  <div className="idea-rationale">
                    <h5 className="rationale-title">Why This Idea Works</h5>
                    <p className="rationale-content">{ideaData.selected_idea.rationale}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overall Reasoning */}
          {ideaData.reasoning && (
            <div className="overall-reasoning">
              <h4 className="reasoning-title">Analysis Summary</h4>
              <p className="reasoning-content">{ideaData.reasoning}</p>
            </div>
          )}
        </div>
      );
    }

    // Default message rendering
    return (
      <div className="message-content">
        {message.text}
      </div>
    );
  };

  return (
    <>
      <div className="app-layout">
        <aside
          className="file-sidebar"
          id="sidebar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Logo at top */}
          <div className="sidebar-header">
            <Link href="/" aria-label="Sreve home">
              <NextImage src="/assets/logo.png" alt="Sreve Logo" className="logo" width={80} height={40} priority />
            </Link>
            <button className="sidebar-toggle" onClick={() => {
              const sidebar = document.querySelector('.file-sidebar');
              sidebar?.classList.toggle('open');
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>


          {/* Project explorer in middle - flex grow */}
          <div className="sidebar-content">
            <SignedIn>
              <button className="new-project-button" onClick={() => {
                console.log('New Project button clicked - clearing selections');
                setSelectedCampaignId(null);
                setSelectedProjectId(null);
              }}>
                + New Project
              </button>
              <ProjectExplorer
                onCampaignSelect={(campaignId, projectId) => {
                  console.log('🎯 [APP] Campaign selected callback triggered:', { campaignId, projectId });
                  console.log('🎯 [APP] Setting selectedCampaignId to:', campaignId);
                  setSelectedCampaignId(campaignId);
                  setSelectedProjectId(projectId);
                }}
                onProjectSelect={(projectId) => {
                  console.log('Project selected:', projectId);
                  setSelectedProjectId(projectId);
                  // Clear campaign selection when switching projects
                  setSelectedCampaignId(null);
                }}
                onCreateProjectClick={() => {
                  console.log('Project creation not available in simplified interface');
                }}
                selectedCampaignId={selectedCampaignId}
                selectedProjectId={selectedProjectId}
              />
            </SignedIn>
            <SignedOut>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                color: '#ccc',
                textAlign: 'center'
              }}>
                <p>Sign in to view your projects</p>
              </div>
            </SignedOut>
          </div>

          {/* Auth at bottom */}
          <div className="sidebar-footer">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button sign-in-sidebar">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="user-info">
                <UserButton />
                <span className="username">{user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User'}</span>
              </div>
            </SignedIn>
          </div>
        </aside>
        <main
          className="main-content"
          style={{
            transition: 'width 0.3s ease'
          }}
        >
          <div className="chat-ui-container">
            <div className="chat-header">
              <h1 className="project-name">
                {selectedProject?.brand_name || 'New Project'}
              </h1>
              <button
                className="edit-button"
                aria-label="Edit project"
                onClick={() => selectedProjectId && setShowProjectDetails(true)}
                disabled={!selectedProjectId}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <div className="chat-interface">
              <div className="chat-messages">
                {messages.map((message) => {
                  const messageType = message.messageType || 'default';
                  return (
                    <div
                      key={message.id}
                      className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'} ${messageType}`}
                    >
                      {renderMessageContent(message)}
                    </div>
                  );
                })}
                {isCreatingProject && (
                  <div className="message assistant-message">
                    <div className="message-content">
                      Creating your project and campaign...
                    </div>
                  </div>
                )}
              </div>

              {/* Retry Button for Sequence Errors */}
              {sequenceError.hasError && (
                <div className="retry-container" style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderTop: '1px solid #333',
                  background: '#1a1a1a'
                }}>
                  <p style={{
                    color: '#ff6b6b',
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}>
                    {sequenceError.errorMessage}
                  </p>
                  <button
                    onClick={retrySequence}
                    disabled={isRetryingSequence}
                    style={{
                      background: '#ff6600',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isRetryingSequence ? 'not-allowed' : 'pointer',
                      opacity: isRetryingSequence ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isRetryingSequence ? '🔄 Retrying...' : '🔄 Retry Analysis'}
                  </button>
                </div>
              )}

              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-input"
                    placeholder="Type your message here..."
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isCreatingProject}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isCreatingProject}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Project Details Modal */}
      {showProjectDetails && selectedProjectId && (
        <ProjectDetails
          projectId={selectedProjectId}
          onClose={() => setShowProjectDetails(false)}
          onProjectUpdate={(updatedProject) => {
            setSelectedProject(updatedProject);
            setShowProjectDetails(false);
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
