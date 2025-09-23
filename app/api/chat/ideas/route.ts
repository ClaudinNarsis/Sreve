import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Ideas API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const CHAT_MESSAGES_TABLE = `ChatMessages_${process.env.ENVIRONMENT}`;

// Helper function to save chat message
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string, ideaData?: unknown) {
  const messageId = uuidv4();
  const messageData = {
    chatMessageId: messageId,
    campaignId,
    userId,
    message,
    sender,
    messageType: messageType || 'default',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...(ideaData && { ideaData })
  };

  try {
    const putCommand = new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: messageData,
    });

    await docClient.send(putCommand);
    console.log(`✅ ${sender} message stored in DynamoDB:`, messageId);
    return messageId;
  } catch (error) {
    console.error(`❌ Failed to save ${sender} message:`, error);
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
    console.log(`✅ Message deleted from DynamoDB:`, messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete message:`, error);
    return false;
  }
}

// Helper function for API calls with timeout and retry
async function makeAPICallWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  timeoutMs: number = 60000
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
        throw new Error(`API call failed after ${maxRetries} attempts`);
      }

      console.log(`⚠️ API call failed (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

    } catch (error) {
      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`API call timed out after ${timeoutMs}ms`);
        }
        throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log(`⚠️ Network error (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Unexpected error in retry logic');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [IDEAS-API] POST /api/chat/ideas - Ideas generation request received');

  try {
    const { userId } = await auth();
    console.log('👤 [IDEAS-API] Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ [IDEAS-API] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 [IDEAS-API] Request data received:', {
      campaignId: requestData.campaignId,
      brandDetailsKeys: Object.keys(requestData.brandDetails || {}),
      selectedAccountsCount: Array.isArray(requestData.selectedAccounts) ? requestData.selectedAccounts.length : 0,
      selectedTrendsCount: Array.isArray(requestData.selectedTrends) ? requestData.selectedTrends.length : 0,
      requestSize: JSON.stringify(requestData).length
    });

    const { campaignId, brandDetails, selectedAccounts = [], selectedTrends = [] } = requestData;

    if (!campaignId || !brandDetails) {
      console.log('❌ [IDEAS-API] Missing required data:', {
        campaignId: !!campaignId,
        brandDetails: !!brandDetails,
        brandDetailsKeys: brandDetails ? Object.keys(brandDetails) : []
      });
      return NextResponse.json({
        error: 'Campaign ID and brand details are required',
        success: false
      }, { status: 400 });
    }

    // Show loading message
    console.log('💬 [IDEAS-API] Creating loading message for campaign:', campaignId);
    const loadingMessage = 'Generating creative content ideas based on the trends and competitor insights...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-final-idea');
    console.log('✅ [IDEAS-API] Loading message created with ID:', loadingBotMessageId);

    try {
      // Make generate_idea API call
      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        console.log('❌ [IDEAS-API] SREVE_CREATOR_API_ENDPOINT not configured');
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      console.log('💡 [IDEAS-API] Making generate_idea API call');
      console.log('📊 [IDEAS-API] Payload summary:', {
        brand_name: brandDetails.brand_name,
        selectedAccountsCount: selectedAccounts.length,
        selectedTrendsCount: selectedTrends.length,
        hasAccounts: selectedAccounts.length > 0,
        hasTrends: selectedTrends.length > 0
      });

      const generateIdeaPayload = {
        brand_details: brandDetails,
        selected_accounts: selectedAccounts,
        selected_trends: selectedTrends
      };

      const apiCallStart = Date.now();
      const generateIdeaResponse = await makeAPICallWithRetry(
        `${sreveApiEndpoint}/generate_idea`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generateIdeaPayload),
        }
      );
      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`⏱️ [IDEAS-API] API call completed in ${apiCallDuration}ms`);

      if (generateIdeaResponse.ok) {
        const ideaData = await generateIdeaResponse.json();
        console.log('💡 [IDEAS-API] Generate-idea API response received:', {
          hasSelectedIdea: !!ideaData?.selected_idea,
          ideasCount: Array.isArray(ideaData?.ideas) ? ideaData.ideas.length : 0,
          hasReasoning: !!ideaData?.reasoning,
          responseSize: JSON.stringify(ideaData).length
        });

        if (ideaData?.ideas && ideaData.selected_idea) {
          const ideasMessage = `Excellent! I've generated creative content ideas based on the trends and competitor analysis. Here are your personalized content suggestions:`;

          // Save ideas results and delete loading message
          console.log('💾 [IDEAS-API] Saving ideas results message');
          const ideasBotMessageId = await saveChatMessage(campaignId, userId, ideasMessage, 'bot', 'idea-preview', ideaData);
          console.log('✅ [IDEAS-API] Ideas results message saved with ID:', ideasBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [IDEAS-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [IDEAS-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [IDEAS-API] Success response sent (${totalDuration}ms total) - FLOW COMPLETED`);

          return NextResponse.json({
            message: 'Ideas generation completed',
            loadingBotMessageId,
            ideasBotMessageId,
            ideasMessage,
            ideaData,
            nextStep: 'critique',
            success: true
          }, { status: 200 });
        } else {
          console.log('ℹ️ [IDEAS-API] No specific ideas found in response');
          const noIdeasMessage = 'I was unable to generate specific content ideas at this time. However, I can still analyze what we have so far...';
          const noIdeasBotMessageId = await saveChatMessage(campaignId, userId, noIdeasMessage, 'bot', 'default');
          console.log('✅ [IDEAS-API] No-ideas message saved with ID:', noIdeasBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [IDEAS-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [IDEAS-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [IDEAS-API] No-ideas response sent (${totalDuration}ms total) - FLOW COMPLETED`);

          return NextResponse.json({
            message: 'Ideas generation completed (no specific ideas generated)',
            loadingBotMessageId,
            noIdeasBotMessageId,
            noIdeasMessage,
            nextStep: 'critique',
            success: true
          }, { status: 200 });
        }
      } else {
        console.log(`❌ [IDEAS-API] API call failed with status: ${generateIdeaResponse.status}`);
        throw new Error(`Ideas API call failed with status: ${generateIdeaResponse.status}`);
      }
    } catch (error) {
      console.error('❌ [IDEAS-API] Generate-idea API call error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        apiEndpoint: process.env.SREVE_CREATOR_API_ENDPOINT ? 'configured' : 'missing'
      });

      // Delete the loading message from DynamoDB
      console.log('🗑️ [IDEAS-API] Deleting loading message from DynamoDB');
      await deleteChatMessage(loadingBotMessageId);
      console.log('✅ [IDEAS-API] Loading message deleted from DynamoDB');

      const totalDuration = Date.now() - startTime;
      console.log(`🎯 [IDEAS-API] Error response sent (${totalDuration}ms total) - SEQUENCE STOPPED`);

      // Return error response to trigger frontend sequence stop
      return NextResponse.json({
        success: false,
        error: {
          code: 'IDEAS_API_ERROR',
          message: 'Ideas generation API failed. Please try again.',
          type: 'api_error',
          step: 'ideas'
        }
      }, { status: 500 });
    }

  } catch (error: unknown) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ [IDEAS-API] Unexpected error in ideas endpoint:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      duration: totalDuration
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'IDEAS_ERROR',
        message: 'Failed to generate ideas. Please try again.',
        type: 'api_error'
      }
    }, { status: 500 });
  }
}