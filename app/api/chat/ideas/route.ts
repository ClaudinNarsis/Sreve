import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

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

// Helper function to connect to WebSocket and generate ideas
async function generateIdeaViaWebSocket(
  wsUrl: string,
  brandDetails: Record<string, unknown>,
  selectedAccounts: unknown[],
  selectedTrends: unknown[],
  prompt: string
): Promise<{
  success: boolean;
  ideaData?: unknown;
  error?: string;
}> {
  return new Promise((resolve) => {
    try {
      console.log('🔌 [WEBSOCKET] Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);

      // Store all 5 ideas from ideas_ready message
      let allIdeas: unknown[] = [];

      // Set overall timeout for the entire operation (60 seconds)
      const overallTimeout = setTimeout(() => {
        console.error('❌ [WEBSOCKET] Overall timeout (60s) reached');
        ws.close();
        resolve({
          success: false,
          error: 'WebSocket operation timed out after 60 seconds'
        });
      }, 60000);

      // Set connection timeout (10 seconds)
      const connectionTimeout = setTimeout(() => {
        console.error('❌ [WEBSOCKET] Connection timeout (10s)');
        ws.close();
        resolve({
          success: false,
          error: 'Failed to connect to WebSocket within 10 seconds'
        });
      }, 10000);

      let messageTimeout: NodeJS.Timeout | undefined;

      ws.on('open', () => {
        console.log('✅ [WEBSOCKET] Connection established');
        clearTimeout(connectionTimeout);

        // Send generate idea request
        const request = {
          action: "generateIdea",
          brand_details: brandDetails,
          selected_accounts: selectedAccounts,
          selected_trends: selectedTrends,
          prompt: prompt
        };

        console.log('📤 [WEBSOCKET] Sending request:', {
          action: request.action,
          brand: brandDetails.brand_name || 'unknown',
          accountsCount: selectedAccounts.length,
          trendsCount: selectedTrends.length
        });

        ws.send(JSON.stringify(request));

        // Set timeout for receiving messages (45 seconds after connection)
        messageTimeout = setTimeout(() => {
          console.error('❌ [WEBSOCKET] Message timeout (45s) reached');
          ws.close();
          resolve({
            success: false,
            error: 'No response received within 45 seconds'
          });
        }, 45000);
      });

      ws.on('message', (rawData: WebSocket.Data) => {
        try {
          const data = JSON.parse(rawData.toString());
          console.log('📨 [WEBSOCKET] Message received:', { type: data.type });

          switch (data.type) {
            case 'connected':
              console.log('✅ [WEBSOCKET] Connected:', data.message);
              break;

            case 'progress':
              console.log(`⏳ [WEBSOCKET] Progress - Stage: ${data.stage}, Message: ${data.message}`);
              // Reset message timeout on each progress update
              if (messageTimeout) clearTimeout(messageTimeout);
              messageTimeout = setTimeout(() => {
                console.error('❌ [WEBSOCKET] Message timeout after progress update');
                ws.close();
                resolve({
                  success: false,
                  error: 'Operation timed out during processing'
                });
              }, 45000);
              break;

            case 'ideas_ready':
              console.log(`✨ [WEBSOCKET] Ideas ready: ${data.count} ideas generated`);
              // Store all 5 ideas for later use
              if (Array.isArray(data.ideas)) {
                allIdeas = data.ideas;
                console.log(`📝 [WEBSOCKET] Stored ${allIdeas.length} ideas for later`);
              }
              break;

            case 'complete':
              console.log('🎉 [WEBSOCKET] Generation complete!');
              if (messageTimeout) clearTimeout(messageTimeout);
              clearTimeout(overallTimeout);

              ws.close();

              // Return both the selected idea and all 5 original ideas
              resolve({
                success: true,
                ideaData: {
                  selected_idea: data.selected_idea,
                  ideas: allIdeas.length > 0 ? allIdeas : [data.selected_idea],
                  reasoning: data.reasoning
                }
              });
              break;

            case 'error':
              console.error('❌ [WEBSOCKET] Error received:', data.message);
              if (messageTimeout) clearTimeout(messageTimeout);
              clearTimeout(overallTimeout);

              ws.close();

              resolve({
                success: false,
                error: data.message || 'WebSocket error occurred'
              });
              break;

            default:
              console.log('ℹ️ [WEBSOCKET] Unknown message type:', data.type);
          }
        } catch (parseError) {
          console.error('❌ [WEBSOCKET] Failed to parse message:', parseError);
        }
      });

      ws.on('error', (error: Error) => {
        console.error('❌ [WEBSOCKET] Connection error:', error.message);
        clearTimeout(connectionTimeout);
        if (messageTimeout) clearTimeout(messageTimeout);
        clearTimeout(overallTimeout);

        resolve({
          success: false,
          error: `WebSocket connection error: ${error.message}`
        });
      });

      ws.on('close', (code: number, reason: Buffer) => {
        console.log('🔌 [WEBSOCKET] Connection closed:', code, reason.toString());
        clearTimeout(connectionTimeout);
        if (messageTimeout) clearTimeout(messageTimeout);
        clearTimeout(overallTimeout);
      });

    } catch (error) {
      console.error('❌ [WEBSOCKET] Failed to create WebSocket:', error);
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create WebSocket connection'
      });
    }
  });
}

// Configure route for extended timeout (if platform supports it)
export const maxDuration = 60; // Try to request 60 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [IDEAS-API] POST /api/chat/ideas - Ideas generation request received');
  console.log('⏰ [IDEAS-API] Function timeout config: maxDuration=60s, current platform limit likely ~30-40s');

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

    // Show loading message with TTL (will auto-expire in 5 minutes)
    console.log('💬 [IDEAS-API] Creating loading message for campaign:', campaignId);
    const loadingMessage = 'Generating creative content ideas based on the trends and competitor insights...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-final-idea', undefined, true);
    console.log('✅ [IDEAS-API] Loading message created with ID and TTL:', loadingBotMessageId);

    try {
      // Get WebSocket URL from environment
      const sreveWebSocketUrl = process.env.SREVE_CREATOR_WEBSOCKET_URL;
      if (!sreveWebSocketUrl) {
        console.log('❌ [IDEAS-API] SREVE_CREATOR_WEBSOCKET_URL not configured');
        throw new Error('SREVE_CREATOR_WEBSOCKET_URL not configured');
      }

      console.log('💡 [IDEAS-API] Starting WebSocket-based idea generation');
      console.log('📊 [IDEAS-API] Payload summary:', {
        brand_name: brandDetails.brand_name,
        selectedAccountsCount: selectedAccounts.length,
        selectedTrendsCount: selectedTrends.length,
        hasAccounts: selectedAccounts.length > 0,
        hasTrends: selectedTrends.length > 0
      });

      const apiCallStart = Date.now();
      const elapsedSinceStart = apiCallStart - startTime;
      console.log('🌐 [IDEAS-API] Starting WebSocket connection...');
      console.log(`⏰ [IDEAS-API] Time already elapsed: ${elapsedSinceStart}ms`);

      // Call WebSocket function
      const wsResult = await generateIdeaViaWebSocket(
        sreveWebSocketUrl,
        brandDetails,
        selectedAccounts,
        selectedTrends,
        brandDetails.format as string || ''
      );

      const apiCallDuration = Date.now() - apiCallStart;
      const totalDuration = Date.now() - startTime;

      console.log(`⏱️ [IDEAS-API] WebSocket operation completed in ${apiCallDuration}ms (total: ${totalDuration}ms)`, {
        success: wsResult.success,
        hasIdeaData: !!wsResult.ideaData,
        hasError: !!wsResult.error
      });

      if (!wsResult.success) {
        console.error('❌ [IDEAS-API] WebSocket operation failed:', wsResult.error);
        throw new Error(wsResult.error || 'WebSocket operation failed');
      }

      const ideaData = wsResult.ideaData as {
        selected_idea?: unknown;
        ideas?: unknown[];
        reasoning?: string;
      };

      console.log('💡 [IDEAS-API] WebSocket response received:', {
        hasSelectedIdea: !!ideaData?.selected_idea,
        ideasCount: Array.isArray(ideaData?.ideas) ? ideaData.ideas.length : 0,
        hasReasoning: !!ideaData?.reasoning,
        responseSize: JSON.stringify(ideaData).length,
        keys: Object.keys(ideaData)
      });

      if (ideaData?.ideas && ideaData.selected_idea) {
        const ideasMessage = `Excellent! I've generated creative content ideas based on the trends and competitor analysis. Here are your personalized content suggestions:`;

        // Save ideas results and delete loading message
        console.log('💾 [IDEAS-API] Saving ideas results message');
        const ideasBotMessageId = await saveChatMessage(campaignId, userId, ideasMessage, 'bot', 'idea-preview', ideaData);
        console.log('✅ [IDEAS-API] Ideas results message saved with ID:', ideasBotMessageId);

        // Save reasoning message if reasoning exists
        let reasoningBotMessageId = null;
        if (ideaData.reasoning) {
          console.log('💾 [IDEAS-API] Saving ideas reasoning message');
          reasoningBotMessageId = await saveChatMessage(campaignId, userId, ideaData.reasoning, 'bot', 'default');
          console.log('✅ [IDEAS-API] Ideas reasoning message saved with ID:', reasoningBotMessageId);
        }

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
          reasoningBotMessageId,
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
    } catch (error) {
      console.error('❌ [IDEAS-API] WebSocket idea generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        websocketUrl: process.env.SREVE_CREATOR_WEBSOCKET_URL ? 'configured' : 'missing'
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