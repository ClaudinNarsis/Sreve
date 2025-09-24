import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Critique API endpoint loaded');

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
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string, critiqueData?: unknown, isLoadingMessage = false) {
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
    ...(critiqueData && { critiqueData }),
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
  console.log('📥 [CRITIQUE-API] POST /api/chat/critique - Critique analysis request received');

  try {
    const { userId } = await auth();
    console.log('👤 [CRITIQUE-API] Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ [CRITIQUE-API] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 [CRITIQUE-API] Request data received:', {
      campaignId: requestData.campaignId,
      hasIdeaString: !!requestData.ideaString,
      hasUserRequirement: !!requestData.userRequirement,
      ideaStringLength: requestData.ideaString?.length || 0,
      userRequirementLength: requestData.userRequirement?.length || 0,
      requestSize: JSON.stringify(requestData).length
    });

    const { campaignId, ideaString, userRequirement } = requestData;

    if (!campaignId || !ideaString || !userRequirement) {
      console.log('❌ [CRITIQUE-API] Missing required data:', {
        campaignId: !!campaignId,
        ideaString: !!ideaString,
        userRequirement: !!userRequirement
      });
      return NextResponse.json({
        error: 'Campaign ID, idea string, and user requirement are required',
        success: false
      }, { status: 400 });
    }

    // Show loading message with TTL (will auto-expire in 5 minutes)
    console.log('💬 [CRITIQUE-API] Creating loading message for campaign:', campaignId);
    const loadingMessage = 'Analyzing and critiquing the generated idea against your requirements...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-critique', undefined, true);
    console.log('✅ [CRITIQUE-API] Loading message created with ID and TTL:', loadingBotMessageId);

    try {
      // Make critique API call
      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        console.log('❌ [CRITIQUE-API] SREVE_CREATOR_API_ENDPOINT not configured');
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      console.log('🎯 [CRITIQUE-API] Making critique API call');
      console.log('📊 [CRITIQUE-API] Payload summary:', {
        ideaStringPreview: ideaString.substring(0, 100) + '...',
        userRequirementPreview: userRequirement.substring(0, 100) + '...',
        ideaLength: ideaString.length,
        requirementLength: userRequirement.length
      });

      const critiquePayload = {
        idea: ideaString,
        user_requirement: userRequirement
      };

      const apiCallStart = Date.now();
      const critiqueResponse = await makeAPICallWithRetry(
        `${sreveApiEndpoint}/critique`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(critiquePayload),
        }
      );
      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`⏱️ [CRITIQUE-API] API call completed in ${apiCallDuration}ms`);

      if (critiqueResponse.ok) {
        const critiqueData = await critiqueResponse.json();
        console.log('🎯 [CRITIQUE-API] Critique API response received:', {
          hasAttentionScore: !!critiqueData?.attention_score,
          hasRelatabilityScore: !!critiqueData?.relatability_score,
          hasOriginalityScore: !!critiqueData?.originality_score,
          hasGoalAlignmentScore: !!critiqueData?.goal_alignment_score,
          overallScore: critiqueData?.overall_score,
          followUpQuestionsCount: Array.isArray(critiqueData?.follow_up_questions) ? critiqueData.follow_up_questions.length : 0,
          responseSize: JSON.stringify(critiqueData).length
        });

        if (critiqueData?.overall_score !== undefined && critiqueData?.attention_score) {
          const critiqueMessage = `Excellent! I've analyzed your content idea and provided a comprehensive critique. Here's how your idea scores across key performance metrics:`;

          // Save critique results and delete loading message
          console.log('💾 [CRITIQUE-API] Saving critique results message');
          const critiqueBotMessageId = await saveChatMessage(campaignId, userId, critiqueMessage, 'bot', 'critique-preview', critiqueData);
          console.log('✅ [CRITIQUE-API] Critique results message saved with ID:', critiqueBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [CRITIQUE-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [CRITIQUE-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [CRITIQUE-API] Success response sent (${totalDuration}ms total) - SEQUENTIAL FLOW COMPLETED`);

          return NextResponse.json({
            message: 'Critique analysis completed',
            loadingBotMessageId,
            critiqueBotMessageId,
            critiqueMessage,
            critiqueData,
            flowCompleted: true,
            success: true
          }, { status: 200 });
        } else {
          console.log('ℹ️ [CRITIQUE-API] No valid critique scores found in response');
          const noCritiqueMessage = 'I\'ve completed the content analysis. Your campaign strategy and ideas are now ready for implementation!';
          const noCritiqueBotMessageId = await saveChatMessage(campaignId, userId, noCritiqueMessage, 'bot', 'default');
          console.log('✅ [CRITIQUE-API] No-critique message saved with ID:', noCritiqueBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [CRITIQUE-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [CRITIQUE-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [CRITIQUE-API] No-critique response sent (${totalDuration}ms total) - SEQUENTIAL FLOW COMPLETED`);

          return NextResponse.json({
            message: 'Critique analysis completed (no scores generated)',
            loadingBotMessageId,
            noCritiqueBotMessageId,
            noCritiqueMessage,
            flowCompleted: true,
            success: true
          }, { status: 200 });
        }
      } else {
        console.log(`❌ [CRITIQUE-API] API call failed with status: ${critiqueResponse.status}`);
        throw new Error(`Critique API call failed with status: ${critiqueResponse.status}`);
      }
    } catch (error) {
      console.error('❌ [CRITIQUE-API] Critique API call error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        apiEndpoint: process.env.SREVE_CREATOR_API_ENDPOINT ? 'configured' : 'missing'
      });

      const errorMessage = 'Your campaign strategy and content ideas are ready! I\'ve gathered comprehensive insights for your marketing campaign.';
      console.log('💾 [CRITIQUE-API] Saving error message');
      const errorBotMessageId = await saveChatMessage(campaignId, userId, errorMessage, 'bot', 'default');
      console.log('✅ [CRITIQUE-API] Error message saved with ID:', errorBotMessageId);

      // Delete the loading message from DynamoDB
      console.log('🗑️ [CRITIQUE-API] Deleting loading message from DynamoDB');
      await deleteChatMessage(loadingBotMessageId);
      console.log('✅ [CRITIQUE-API] Loading message deleted from DynamoDB');

      const totalDuration = Date.now() - startTime;
      console.log(`🎯 [CRITIQUE-API] Error response sent (${totalDuration}ms total) - SEQUENTIAL FLOW COMPLETED`);

      return NextResponse.json({
        message: 'Critique analysis failed, but flow completed',
        loadingBotMessageId,
        errorBotMessageId,
        errorMessage,
        flowCompleted: true,
        success: true
      }, { status: 200 });
    }

  } catch (error: unknown) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ [CRITIQUE-API] Unexpected error in critique endpoint:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      duration: totalDuration
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'CRITIQUE_ERROR',
        message: 'Failed to analyze critique. Please try again.',
        type: 'api_error'
      }
    }, { status: 500 });
  }
}