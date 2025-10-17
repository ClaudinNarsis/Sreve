import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Ideas Change-Idea API endpoint loaded');

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
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string, ideaData?: unknown, isLoadingMessage = false) {
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
    ...(ideaData && { ideaData }),
    // Add TTL for loading messages only (5 minutes expiration)
    ...(isLoadingMessage && { ttl: Math.floor(Date.now() / 1000) + (5 * 60) })
  };

  try {
    const putCommand = new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: messageData,
    });

    await docClient.send(putCommand);
    console.log(`✅ [CHANGE-IDEA] ${sender} message stored in DynamoDB:`, messageId);
    return messageId;
  } catch (error) {
    console.error(`❌ [CHANGE-IDEA] Failed to save ${sender} message:`, error);
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
    console.log(`✅ [CHANGE-IDEA] Message deleted from DynamoDB:`, messageId);
    return true;
  } catch (error) {
    console.error(`❌ [CHANGE-IDEA] Failed to delete message:`, error);
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

      console.log(`⚠️ [CHANGE-IDEA] API call failed (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

    } catch (error) {
      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`API call timed out after ${timeoutMs}ms`);
        }
        throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log(`⚠️ [CHANGE-IDEA] Network error (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Unexpected error in retry logic');
}

// Configure route for extended timeout
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `change_idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📥 [CHANGE-IDEA-API] [${requestId}] POST /api/chat/ideas/change-idea - Request received`);
  console.log(`⏰ [CHANGE-IDEA-API] [${requestId}] Timestamp: ${new Date().toISOString()}`);

  try {
    // Step 1: Authentication
    console.log(`🔐 [CHANGE-IDEA-API] [${requestId}] Step 1: Checking authentication...`);
    const authStartTime = Date.now();

    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Authentication successful (${Date.now() - authStartTime}ms)`);
      console.log(`👤 [CHANGE-IDEA-API] [${requestId}] User ID: ${userId}`);
    } catch (authError) {
      console.error(`❌ [CHANGE-IDEA-API] [${requestId}] Authentication failed:`, authError);
      throw authError;
    }

    if (!userId) {
      console.log(`❌ [CHANGE-IDEA-API] [${requestId}] No user ID returned from auth`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Parse request body
    console.log(`📦 [CHANGE-IDEA-API] [${requestId}] Step 2: Parsing request body...`);
    const parseStartTime = Date.now();

    let requestData: {
      campaignId?: string;
      ideas?: unknown[];
      request_prompt?: string;
      selected_idea?: { angle: string; description: string };
    };
    try {
      requestData = await request.json();
      console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Request body parsed (${Date.now() - parseStartTime}ms)`);
      console.log(`📋 [CHANGE-IDEA-API] [${requestId}] Request data summary:`, {
        hasCampaignId: !!requestData.campaignId,
        campaignId: requestData.campaignId,
        ideasCount: Array.isArray(requestData.ideas) ? requestData.ideas.length : 0,
        requestPromptLength: requestData.request_prompt?.length || 0,
        hasSelectedIdea: !!requestData.selected_idea,
        selectedIdeaAngle: requestData.selected_idea?.angle
      });
    } catch (parseError) {
      console.error(`❌ [CHANGE-IDEA-API] [${requestId}] Failed to parse request body:`, parseError);
      throw parseError;
    }

    const { campaignId, ideas = [], request_prompt = '', selected_idea } = requestData;

    // Step 3: Validate required fields
    console.log(`✔️ [CHANGE-IDEA-API] [${requestId}] Step 3: Validating required fields...`);
    if (!campaignId || !Array.isArray(ideas) || !request_prompt) {
      console.error(`❌ [CHANGE-IDEA-API] [${requestId}] Validation failed - Missing required data:`, {
        hasCampaignId: !!campaignId,
        hasIdeas: Array.isArray(ideas),
        ideasCount: Array.isArray(ideas) ? ideas.length : 0,
        hasRequestPrompt: !!request_prompt
      });
      return NextResponse.json({
        error: 'Campaign ID, ideas array, and request prompt are required',
        success: false
      }, { status: 400 });
    }

    console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Validation passed`);

    // Step 4: Save user message
    console.log(`💾 [CHANGE-IDEA-API] [${requestId}] Step 4: Saving user message...`);
    const userMessageId = await saveChatMessage(campaignId, userId, request_prompt, 'user');
    console.log(`✅ [CHANGE-IDEA-API] [${requestId}] User message saved:`, userMessageId);

    // Step 5: Create loading message in DynamoDB
    console.log(`💬 [CHANGE-IDEA-API] [${requestId}] Step 5: Creating loading message in DynamoDB...`);
    const loadingMessage = 'Generating new creative content ideas based on your request...';

    let loadingBotMessageId: string;
    try {
      loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-final-idea', undefined, true);
      console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Loading message created:`, loadingBotMessageId);
    } catch (saveMsgError) {
      console.error(`❌ [CHANGE-IDEA-API] [${requestId}] Failed to save loading message:`, saveMsgError);
      throw saveMsgError;
    }

    try {
      // Step 6: Make change-idea API call
      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        console.log(`❌ [CHANGE-IDEA-API] [${requestId}] SREVE_CREATOR_API_ENDPOINT not configured`);
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      console.log(`🔍 [CHANGE-IDEA-API] [${requestId}] Making change-idea API call`);

      const requestPayload = {
        ideas: ideas,
        request_prompt: request_prompt,
        ...(selected_idea && { selected_idea })
      };

      console.log(`📊 [CHANGE-IDEA-API] [${requestId}] Payload summary:`, {
        ideasCount: ideas.length,
        requestPromptPreview: request_prompt.substring(0, 100),
        hasSelectedIdea: !!selected_idea,
        selectedIdeaAngle: selected_idea?.angle
      });

      console.log(`📤 [CHANGE-IDEA-API] [${requestId}] FULL REQUEST PAYLOAD:`, JSON.stringify(requestPayload, null, 2));

      const apiCallStart = Date.now();
      const changeIdeaResponse = await makeAPICallWithRetry(
        `${sreveApiEndpoint}/change-idea`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        },
        3,
        60000 // 60 second timeout
      );
      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`⏱️ [CHANGE-IDEA-API] [${requestId}] API call completed in ${apiCallDuration}ms`);

      if (changeIdeaResponse.ok) {
        const ideaData = await changeIdeaResponse.json();

        // Log raw response for debugging
        console.log(`📦 [CHANGE-IDEA-API] [${requestId}] RAW API RESPONSE:`, JSON.stringify(ideaData, null, 2));

        console.log(`💡 [CHANGE-IDEA-API] [${requestId}] API response received:`, {
          hasIdeas: !!ideaData.ideas,
          ideasCount: Array.isArray(ideaData.ideas) ? ideaData.ideas.length : 0,
          hasReasoning: !!ideaData.reasoning,
          responseKeys: Object.keys(ideaData || {}),
          ideasType: typeof ideaData?.ideas,
          ideasValue: ideaData?.ideas
        });

        // Check if ideaData has valid ideas
        if (ideaData && ideaData.ideas && Array.isArray(ideaData.ideas) && ideaData.ideas.length > 0) {
          const ideasMessage = `I've generated new creative content ideas based on your request:`;

          // Save ideas results message
          console.log(`💾 [CHANGE-IDEA-API] [${requestId}] Saving ideas results message`);
          const ideasBotMessageId = await saveChatMessage(campaignId, userId, ideasMessage, 'bot', 'idea-preview', ideaData);
          console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Ideas results message saved with ID:`, ideasBotMessageId);

          // Save reasoning message if exists
          let reasoningBotMessageId = null;
          if (ideaData.reasoning) {
            console.log(`💾 [CHANGE-IDEA-API] [${requestId}] Saving reasoning message`);
            reasoningBotMessageId = await saveChatMessage(campaignId, userId, ideaData.reasoning, 'bot', 'default');
            console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Reasoning message saved with ID:`, reasoningBotMessageId);
          }

          // Delete the loading message from DynamoDB
          console.log(`🗑️ [CHANGE-IDEA-API] [${requestId}] Deleting loading message`);
          await deleteChatMessage(loadingBotMessageId);
          console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Loading message deleted`);

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [CHANGE-IDEA-API] [${requestId}] Success response sent (${totalDuration}ms total)`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          return NextResponse.json({
            message: 'Ideas changed successfully',
            userMessageId,
            loadingBotMessageId,
            ideasBotMessageId,
            ideasMessage,
            ideaData,
            reasoningBotMessageId,
            success: true
          }, { status: 200 });
        } else {
          console.log(`ℹ️ [CHANGE-IDEA-API] [${requestId}] No valid ideas in response`);

          const noIdeasMessage = 'I was unable to generate new ideas at this time. Please try rephrasing your request.';
          const noIdeasBotMessageId = await saveChatMessage(campaignId, userId, noIdeasMessage, 'bot', 'default');

          // Delete the loading message
          await deleteChatMessage(loadingBotMessageId);

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [CHANGE-IDEA-API] [${requestId}] No-ideas response sent (${totalDuration}ms total)`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          return NextResponse.json({
            message: 'Ideas change completed (no ideas generated)',
            userMessageId,
            loadingBotMessageId,
            noIdeasBotMessageId,
            noIdeasMessage,
            success: true
          }, { status: 200 });
        }
      } else {
        console.log(`❌ [CHANGE-IDEA-API] [${requestId}] API call failed with status: ${changeIdeaResponse.status}`);
        throw new Error(`Change-idea API call failed with status: ${changeIdeaResponse.status}`);
      }
    } catch (error) {
      console.error(`❌ [CHANGE-IDEA-API] [${requestId}] API call error:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });

      const errorMessage = 'I\'m having trouble generating new ideas right now. Please try again or rephrase your request.';
      console.log(`💾 [CHANGE-IDEA-API] [${requestId}] Saving error message`);
      const errorBotMessageId = await saveChatMessage(campaignId, userId, errorMessage, 'bot', 'default');
      console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Error message saved with ID:`, errorBotMessageId);

      // Delete the loading message from DynamoDB
      console.log(`🗑️ [CHANGE-IDEA-API] [${requestId}] Deleting loading message`);
      await deleteChatMessage(loadingBotMessageId);
      console.log(`✅ [CHANGE-IDEA-API] [${requestId}] Loading message deleted`);

      const totalDuration = Date.now() - startTime;
      console.log(`🎯 [CHANGE-IDEA-API] [${requestId}] Error response sent (${totalDuration}ms total)`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return NextResponse.json({
        message: 'Ideas change failed, but handled gracefully',
        userMessageId,
        loadingBotMessageId,
        errorBotMessageId,
        responseMessage: errorMessage,
        success: true
      }, { status: 200 });
    }

  } catch (error: unknown) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ [CHANGE-IDEA-API] [${requestId}] UNCAUGHT EXCEPTION:`, error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: false,
      error: {
        code: 'CHANGE_IDEA_ERROR',
        message: 'Failed to change ideas. Please try again.',
        type: 'api_error',
        requestId,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
