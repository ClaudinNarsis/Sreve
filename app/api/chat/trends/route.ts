import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Trends API endpoint loaded');

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
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string, trendData?: unknown, isLoadingMessage = false) {
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
    ...(trendData && { trendData }),
    // Add TTL for loading messages only (5 minutes expiration)
    ...(isLoadingMessage && { ttl: Math.floor(Date.now() / 1000) + (5 * 60) })
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
  console.log('📥 [TRENDS-API] POST /api/chat/trends - Trends analysis request received');

  try {
    const { userId } = await auth();
    console.log('👤 [TRENDS-API] Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ [TRENDS-API] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 [TRENDS-API] Request data received:', {
      campaignId: requestData.campaignId,
      brandDetailsKeys: Object.keys(requestData.brandDetails || {}),
      requestSize: JSON.stringify(requestData).length
    });

    const { campaignId, brandDetails } = requestData;

    if (!campaignId || !brandDetails) {
      console.log('❌ [TRENDS-API] Missing required data:', {
        campaignId: !!campaignId,
        brandDetails: !!brandDetails,
        brandDetailsKeys: brandDetails ? Object.keys(brandDetails) : []
      });
      return NextResponse.json({
        error: 'Campaign ID and brand details are required',
        success: false
      }, { status: 400 });
    }

    // Show loading message with TTL (will auto-expire in 5 minutes)
    console.log('💬 [TRENDS-API] Creating loading message for campaign:', campaignId);
    const loadingMessage = 'Analyzing current market trends for your brand...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-trends', undefined, true);
    console.log('✅ [TRENDS-API] Loading message created with ID and TTL:', loadingBotMessageId);

    try {
      // Make find-trend API call
      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        console.log('❌ [TRENDS-API] SREVE_CREATOR_API_ENDPOINT not configured');
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      console.log('🔍 [TRENDS-API] Making find-trend API call');
      console.log('📊 [TRENDS-API] Brand details summary:', {
        brand_name: brandDetails.brand_name,
        offering: brandDetails.offering ? 'provided' : 'missing',
        platform: brandDetails.platform,
        goal: brandDetails.goal
      });

      const apiCallStart = Date.now();
      const findTrendResponse = await makeAPICallWithRetry(
        `${sreveApiEndpoint}/find-trend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_details: brandDetails }),
        }
      );
      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`⏱️ [TRENDS-API] API call completed in ${apiCallDuration}ms`);

      if (findTrendResponse.ok) {
        const trendData = await findTrendResponse.json();
        console.log('📈 [TRENDS-API] Find-trend API response received:', {
          hasChosenTrend: !!trendData.chosen_trend,
          trendId: trendData.chosen_trend?.trend_id,
          trendStatus: trendData.chosen_trend?.status,
          platform: trendData.chosen_trend?.platform,
          examplesCount: trendData.chosen_trend?.examples?.length || 0,
          isEmptyObject: Object.keys(trendData).length === 0
        });

        // Check if trendData is empty JSON or has no chosen_trend
        const isEmptyResponse = !trendData || Object.keys(trendData).length === 0 || !trendData.chosen_trend;

        if (!isEmptyResponse && trendData.chosen_trend) {
          const trendMessage = `Great! I've found a trending opportunity for your brand. Here's what's working right now:`;

          // Save trend results message and delete loading message
          console.log('💾 [TRENDS-API] Saving trend results message');
          const trendBotMessageId = await saveChatMessage(campaignId, userId, trendMessage, 'bot', 'trend-preview', trendData);
          console.log('✅ [TRENDS-API] Trend results message saved with ID:', trendBotMessageId);

          // Save reasoning message if reason exists
          let reasoningBotMessageId = null;
          if (trendData.reason) {
            console.log('💾 [TRENDS-API] Saving trend reasoning message');
            reasoningBotMessageId = await saveChatMessage(campaignId, userId, trendData.reason, 'bot', 'default');
            console.log('✅ [TRENDS-API] Trend reasoning message saved with ID:', reasoningBotMessageId);
          }

          // Delete the loading message from DynamoDB
          console.log('🗑️ [TRENDS-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [TRENDS-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [TRENDS-API] Success response sent (${totalDuration}ms total)`);

          return NextResponse.json({
            message: 'Trends analysis completed',
            loadingBotMessageId,
            trendBotMessageId,
            trendMessage,
            trendData,
            reasoningBotMessageId,
            nextStep: 'accounts',
            success: true
          }, { status: 200 });
        } else {
          console.log('ℹ️ [TRENDS-API] No trends found in response (empty JSON or no chosen_trend)');

          // Delete the loading message from DynamoDB without creating a replacement message
          console.log('🗑️ [TRENDS-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [TRENDS-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [TRENDS-API] Empty response - skipping to accounts (${totalDuration}ms total)`);

          return NextResponse.json({
            message: 'Trends analysis completed (no trends found)',
            loadingBotMessageId,
            trendData: null,
            nextStep: 'accounts',
            success: true
          }, { status: 200 });
        }
      } else {
        console.log(`❌ [TRENDS-API] API call failed with status: ${findTrendResponse.status}`);
        throw new Error(`Trends API call failed with status: ${findTrendResponse.status}`);
      }
    } catch (error) {
      console.error('❌ [TRENDS-API] Find-trend API call error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        apiEndpoint: process.env.SREVE_CREATOR_API_ENDPOINT ? 'configured' : 'missing'
      });

      const errorMessage = 'Unable to analyze trends at the moment. Moving to the next step...';
      console.log('💾 [TRENDS-API] Saving error message');
      const errorBotMessageId = await saveChatMessage(campaignId, userId, errorMessage, 'bot', 'default');
      console.log('✅ [TRENDS-API] Error message saved with ID:', errorBotMessageId);

      // Delete the loading message from DynamoDB
      console.log('🗑️ [TRENDS-API] Deleting loading message from DynamoDB');
      await deleteChatMessage(loadingBotMessageId);
      console.log('✅ [TRENDS-API] Loading message deleted from DynamoDB');

      const totalDuration = Date.now() - startTime;
      console.log(`🎯 [TRENDS-API] Error response sent (${totalDuration}ms total)`);

      return NextResponse.json({
        message: 'Trends analysis failed, continuing',
        loadingBotMessageId,
        errorBotMessageId,
        errorMessage,
        nextStep: 'accounts',
        success: true
      }, { status: 200 });
    }

  } catch (error: unknown) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ [TRENDS-API] Unexpected error in trends endpoint:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      duration: totalDuration
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'TRENDS_ERROR',
        message: 'Failed to analyze trends. Please try again.',
        type: 'api_error'
      }
    }, { status: 500 });
  }
}