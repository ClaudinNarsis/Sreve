import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Follow-up API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const CHAT_MESSAGES_TABLE = `ChatMessages_${process.env.ENVIRONMENT}`;

// Interface for follow-up context payload
interface FollowUpContextPayload {
  projectDetails?: {
    brand_name: string;
    offering: string;
    usp: string;
    icp: string;
    brand_voice: string;
    competitors: string;
    additional_information: string;
  };
  campaignDetails?: {
    campaignId: string;
    name: string;
    description: string;
    goal: string;
    platform: string;
  };
  selectedIdea?: {
    angle: string;
    hook: string;
    description: string;
    execution_script?: string;
    scores?: {
      Attention: number;
      'Trend-Fit': number;
      Originality: number;
      'Brand-Fit': number;
    };
    rationale?: string;
  };
  lastMessages?: Array<{
    sender: string;
    text: string;
    timestamp: Date;
  }>;
}

// Helper function to save chat message
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string) {
  const messageId = uuidv4();
  const messageData = {
    chatMessageId: messageId,
    campaignId,
    userId,
    message,
    sender,
    messageType: messageType || 'default',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  try {
    const putCommand = new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: messageData,
    });

    await docClient.send(putCommand);
    console.log(`✅ [FOLLOW-UP] ${sender} message stored in DynamoDB:`, messageId);
    return messageId;
  } catch (error) {
    console.error(`❌ [FOLLOW-UP] Failed to save ${sender} message:`, error);
    throw error;
  }
}

// Helper function to delete a chat message
async function deleteChatMessage(messageId: string) {
  try {
    const deleteCommand = new DeleteCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Key: { chatMessageId: messageId },
    });

    await docClient.send(deleteCommand);
    console.log(`✅ [FOLLOW-UP] Message deleted from DynamoDB:`, messageId);
    return true;
  } catch (error) {
    console.error(`❌ [FOLLOW-UP] Failed to delete message:`, error);
    return false;
  }
}

// Helper function for API calls with timeout and retry
async function makeAPICallWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  timeoutMs: number = 30000
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status < 500) {
        return response;
      }

      if (attempt === maxRetries) {
        throw new Error(`Follow-up API call failed after ${maxRetries} attempts`);
      }

      console.log(`⚠️ [FOLLOW-UP] API call failed (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

    } catch (error) {
      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Follow-up API call timed out after ${timeoutMs}ms`);
        }
        throw new Error(`Follow-up network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log(`⚠️ [FOLLOW-UP] Network error (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Unexpected error in follow-up retry logic');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [FOLLOW-UP] POST /api/follow-up - Follow-up request received');

  try {
    const { userId } = await auth();
    console.log('👤 [FOLLOW-UP] Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ [FOLLOW-UP] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 [FOLLOW-UP] Request data received:', {
      hasContext: !!requestData.context,
      hasQuery: !!requestData.query,
      campaignId: requestData.context?.campaignDetails?.campaignId,
      queryLength: requestData.query?.length || 0,
      requestSize: JSON.stringify(requestData).length
    });

    const { context, query } = requestData;

    if (!context || !query) {
      console.log('❌ [FOLLOW-UP] Missing required data:', {
        context: !!context,
        query: !!query
      });
      return NextResponse.json({
        error: 'Context and query are required',
        success: false
      }, { status: 400 });
    }

    const { projectDetails, campaignDetails, selectedIdea, lastMessages } = context;
    const campaignId = campaignDetails?.campaignId;

    if (!campaignId) {
      console.log('❌ [FOLLOW-UP] Missing campaign ID in context');
      return NextResponse.json({
        error: 'Campaign ID is required in context',
        success: false
      }, { status: 400 });
    }

    // Save user message first
    console.log('💾 [FOLLOW-UP] Saving user message to database');
    const userMessageId = await saveChatMessage(campaignId, userId, query, 'user');

    // Show loading message
    console.log('💬 [FOLLOW-UP] Creating loading message for campaign:', campaignId);
    const loadingMessage = 'Processing your follow-up question...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-followup');
    console.log('✅ [FOLLOW-UP] Loading message created with ID:', loadingBotMessageId);

    try {
      // Prepare context object for follow-up API
      const contextPayload: FollowUpContextPayload = {};

      // Add project details
      if (projectDetails) {
        contextPayload.projectDetails = {
          brand_name: projectDetails.brand_name || '',
          offering: projectDetails.offering || '',
          usp: projectDetails.usp || '',
          icp: projectDetails.icp || '',
          brand_voice: projectDetails.brand_voice || '',
          competitors: projectDetails.competitors || '',
          additional_information: projectDetails.additional_information || ''
        };
      }

      // Add campaign details
      if (campaignDetails) {
        contextPayload.campaignDetails = {
          campaignId: campaignDetails.campaignId || '',
          name: campaignDetails.name || '',
          description: campaignDetails.description || '',
          goal: campaignDetails.goal || '',
          platform: campaignDetails.platform || ''
        };
      }

      // Add selected idea if available
      if (selectedIdea) {
        contextPayload.selectedIdea = {
          angle: selectedIdea.angle || '',
          hook: selectedIdea.hook || '',
          description: selectedIdea.description || '',
          execution_script: selectedIdea.execution_script || '',
          scores: selectedIdea.scores || undefined,
          rationale: selectedIdea.rationale || ''
        };
      }

      // Add recent conversation history
      if (lastMessages && Array.isArray(lastMessages) && lastMessages.length > 0) {
        contextPayload.lastMessages = lastMessages
          .filter(msg => msg.text && msg.sender) // Only include valid messages
          .map(msg => ({
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp
          }));
      }

      // Make follow-up API call
      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        console.log('❌ [FOLLOW-UP] SREVE_CREATOR_API_ENDPOINT not configured');
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      console.log('🎯 [FOLLOW-UP] Making follow-up API call');
      console.log('📊 [FOLLOW-UP] Entire payload context:', JSON.stringify(contextPayload, null, 2));
      console.log('📊 [FOLLOW-UP] Payload summary:', {
        queryPreview: query.substring(0, 100) + '...',
        hasProjectDetails: !!contextPayload.projectDetails,
        hasCampaignDetails: !!contextPayload.campaignDetails,
        hasSelectedIdea: !!contextPayload.selectedIdea,
        messageCount: contextPayload.lastMessages?.length || 0,
        queryLength: query.length
      });

      const followUpPayload = {
        context: contextPayload,
        query: query
      };

      const apiCallStart = Date.now();
      const followUpResponse = await makeAPICallWithRetry(
        `${sreveApiEndpoint}/follow-up`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(followUpPayload),
        }
      );
      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`⏱️ [FOLLOW-UP] API call completed in ${apiCallDuration}ms`);

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        console.log('🎯 [FOLLOW-UP] Follow-up API response received:', {
          hasResponse: !!followUpData?.response,
          responseLength: followUpData?.response?.length || 0,
          responseSize: JSON.stringify(followUpData).length
        });

        if (followUpData?.response) {
          const responseMessage = followUpData.response;

          // Save follow-up response and delete loading message
          console.log('💾 [FOLLOW-UP] Saving follow-up response message');
          const responseBotMessageId = await saveChatMessage(campaignId, userId, responseMessage, 'bot', 'default');
          console.log('✅ [FOLLOW-UP] Follow-up response message saved with ID:', responseBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [FOLLOW-UP] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [FOLLOW-UP] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [FOLLOW-UP] Success response sent (${totalDuration}ms total)`);

          return NextResponse.json({
            message: 'Follow-up completed successfully',
            userMessageId,
            loadingBotMessageId,
            responseBotMessageId,
            responseMessage,
            success: true
          }, { status: 200 });
        } else {
          console.log('ℹ️ [FOLLOW-UP] No valid response found in API result');
          const noResponseMessage = 'I understand your question. Could you please provide more specific details so I can give you a better answer?';
          const noResponseBotMessageId = await saveChatMessage(campaignId, userId, noResponseMessage, 'bot', 'default');
          console.log('✅ [FOLLOW-UP] No-response message saved with ID:', noResponseBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [FOLLOW-UP] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [FOLLOW-UP] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [FOLLOW-UP] No-response sent (${totalDuration}ms total)`);

          return NextResponse.json({
            message: 'Follow-up completed (no response generated)',
            userMessageId,
            loadingBotMessageId,
            noResponseBotMessageId,
            responseMessage: noResponseMessage,
            success: true
          }, { status: 200 });
        }
      } else {
        console.log(`❌ [FOLLOW-UP] API call failed with status: ${followUpResponse.status}`);
        throw new Error(`Follow-up API call failed with status: ${followUpResponse.status}`);
      }
    } catch (error) {
      console.error('❌ [FOLLOW-UP] Follow-up API call error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        apiEndpoint: process.env.SREVE_CREATOR_API_ENDPOINT ? 'configured' : 'missing'
      });

      const errorMessage = 'I\'m having trouble processing your follow-up question right now. Please try again or rephrase your question.';
      console.log('💾 [FOLLOW-UP] Saving error message');
      const errorBotMessageId = await saveChatMessage(campaignId, userId, errorMessage, 'bot', 'default');
      console.log('✅ [FOLLOW-UP] Error message saved with ID:', errorBotMessageId);

      // Delete the loading message from DynamoDB
      console.log('🗑️ [FOLLOW-UP] Deleting loading message from DynamoDB');
      await deleteChatMessage(loadingBotMessageId);
      console.log('✅ [FOLLOW-UP] Loading message deleted from DynamoDB');

      const totalDuration = Date.now() - startTime;
      console.log(`🎯 [FOLLOW-UP] Error response sent (${totalDuration}ms total)`);

      return NextResponse.json({
        message: 'Follow-up failed, but handled gracefully',
        userMessageId,
        loadingBotMessageId,
        errorBotMessageId,
        responseMessage: errorMessage,
        success: true
      }, { status: 200 });
    }

  } catch (error: unknown) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ [FOLLOW-UP] Unexpected error in follow-up endpoint:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      duration: totalDuration
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'FOLLOW_UP_ERROR',
        message: 'Failed to process follow-up question. Please try again.',
        type: 'api_error'
      }
    }, { status: 500 });
  }
}