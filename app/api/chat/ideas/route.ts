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
    const wsConnectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    console.log(`🔌 [WEBSOCKET] [${wsConnectionId}] Initiating connection...`);
    console.log(`🔗 [WEBSOCKET] [${wsConnectionId}] Target URL: ${wsUrl}`);
    console.log(`📊 [WEBSOCKET] [${wsConnectionId}] Request parameters:`, {
      brandName: brandDetails.brand_name || 'unknown',
      accountsCount: selectedAccounts.length,
      trendsCount: selectedTrends.length,
      hasPrompt: !!prompt
    });

    try {
      const ws = new WebSocket(wsUrl);
      console.log(`✅ [WEBSOCKET] [${wsConnectionId}] WebSocket object created, waiting for connection...`);

      // Store all 5 ideas from ideas_ready message
      let allIdeas: unknown[] = [];
      let messagesReceived = 0;
      let lastMessageTime = Date.now();

      // Set overall timeout for the entire operation (60 seconds)
      const overallTimeout = setTimeout(() => {
        console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Overall timeout (60s) reached`);
        console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Stats at timeout:`, {
          messagesReceived,
          lastMessageReceived: Date.now() - lastMessageTime,
          hasIdeas: allIdeas.length > 0
        });
        ws.close();
        resolve({
          success: false,
          error: 'WebSocket operation timed out after 60 seconds'
        });
      }, 60000);

      // Set connection timeout (10 seconds)
      const connectionTimeout = setTimeout(() => {
        console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Connection timeout (10s)`);
        ws.close();
        resolve({
          success: false,
          error: 'Failed to connect to WebSocket within 10 seconds'
        });
      }, 10000);

      let messageTimeout: NodeJS.Timeout | undefined;

      ws.on('open', () => {
        const connectionTime = Date.now() - lastMessageTime;
        console.log(`✅ [WEBSOCKET] [${wsConnectionId}] Connection established (${connectionTime}ms)`);
        clearTimeout(connectionTimeout);

        // Send generate idea request
        const request = {
          action: "generateIdea",
          brand_details: brandDetails,
          selected_accounts: selectedAccounts,
          selected_trends: selectedTrends,
          prompt: prompt
        };

        const requestPayload = JSON.stringify(request);
        console.log(`📤 [WEBSOCKET] [${wsConnectionId}] Sending request:`, {
          action: request.action,
          brand: brandDetails.brand_name || 'unknown',
          accountsCount: selectedAccounts.length,
          trendsCount: selectedTrends.length,
          payloadSize: requestPayload.length
        });

        try {
          ws.send(requestPayload);
          console.log(`✅ [WEBSOCKET] [${wsConnectionId}] Request sent successfully`);
        } catch (sendError) {
          console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Failed to send request:`, {
            error: sendError instanceof Error ? sendError.message : 'Unknown error',
            stack: sendError instanceof Error ? sendError.stack : 'N/A'
          });
          ws.close();
          resolve({
            success: false,
            error: `Failed to send WebSocket request: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`
          });
          return;
        }

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
        messagesReceived++;
        lastMessageTime = Date.now();

        try {
          const rawString = rawData.toString();
          console.log(`📨 [WEBSOCKET] [${wsConnectionId}] Message #${messagesReceived} received (${rawString.length} bytes)`);

          const data = JSON.parse(rawString);
          console.log(`📨 [WEBSOCKET] [${wsConnectionId}] Message type: ${data.type}`);

          switch (data.type) {
            case 'connected':
              console.log(`✅ [WEBSOCKET] [${wsConnectionId}] Connected confirmation:`, data.message);
              break;

            case 'progress':
              console.log(`⏳ [WEBSOCKET] [${wsConnectionId}] Progress update:`, {
                stage: data.stage,
                message: data.message,
                selectedIndex: data.selected_index
              });
              // Reset message timeout on each progress update
              if (messageTimeout) clearTimeout(messageTimeout);
              messageTimeout = setTimeout(() => {
                console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Message timeout after progress update`);
                console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Last stage: ${data.stage}`);
                ws.close();
                resolve({
                  success: false,
                  error: 'Operation timed out during processing'
                });
              }, 45000);
              break;

            case 'ideas_ready':
              console.log(`✨ [WEBSOCKET] [${wsConnectionId}] Ideas ready:`, {
                count: data.count,
                hasIdeasArray: Array.isArray(data.ideas),
                ideasLength: Array.isArray(data.ideas) ? data.ideas.length : 0
              });
              // Store all 5 ideas for later use
              if (Array.isArray(data.ideas)) {
                allIdeas = data.ideas;
                console.log(`📝 [WEBSOCKET] [${wsConnectionId}] Stored ${allIdeas.length} ideas:`,
                  allIdeas.map((idea: unknown) => (idea as { angle?: string }).angle || 'no-angle').join(', ')
                );
              }
              break;

            case 'complete':
              const completionTime = Date.now() - lastMessageTime;
              console.log(`🎉 [WEBSOCKET] [${wsConnectionId}] Generation complete (${completionTime}ms since last message)`);
              console.log(`📊 [WEBSOCKET] [${wsConnectionId}] Final data:`, {
                hasSelectedIdea: !!data.selected_idea,
                selectedIdeaKeys: data.selected_idea ? Object.keys(data.selected_idea) : [],
                storedIdeasCount: allIdeas.length,
                hasReasoning: !!data.reasoning,
                reasoningLength: data.reasoning?.length || 0
              });

              if (messageTimeout) clearTimeout(messageTimeout);
              clearTimeout(overallTimeout);

              ws.close();

              // Return both the selected idea and all 5 original ideas
              const finalData = {
                success: true,
                ideaData: {
                  selected_idea: data.selected_idea,
                  ideas: allIdeas.length > 0 ? allIdeas : [data.selected_idea],
                  reasoning: data.reasoning
                }
              };
              console.log(`✅ [WEBSOCKET] [${wsConnectionId}] Resolving with data (${messagesReceived} messages total)`);
              resolve(finalData);
              break;

            case 'error':
              console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Error received:`, {
                message: data.message,
                error: data.error,
                messagesReceived
              });
              if (messageTimeout) clearTimeout(messageTimeout);
              clearTimeout(overallTimeout);

              ws.close();

              resolve({
                success: false,
                error: data.message || 'WebSocket error occurred'
              });
              break;

            default:
              console.warn(`⚠️ [WEBSOCKET] [${wsConnectionId}] Unknown message type: ${data.type}`, {
                keys: Object.keys(data)
              });
          }
        } catch (parseError) {
          console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Failed to parse message:`, {
            error: parseError instanceof Error ? parseError.message : 'Unknown error',
            rawDataLength: rawData.toString().length,
            rawDataPreview: rawData.toString().substring(0, 200),
            messagesReceived
          });
        }
      });

      ws.on('error', (error: Error) => {
        console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Connection error:`, {
          error: error.message,
          errorType: error.constructor.name,
          messagesReceived,
          hasIdeas: allIdeas.length > 0,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        });
        clearTimeout(connectionTimeout);
        if (messageTimeout) clearTimeout(messageTimeout);
        clearTimeout(overallTimeout);

        resolve({
          success: false,
          error: `WebSocket connection error: ${error.message}`
        });
      });

      ws.on('close', (code: number, reason: Buffer) => {
        const reasonString = reason.toString();
        console.log(`🔌 [WEBSOCKET] [${wsConnectionId}] Connection closed:`, {
          code,
          reason: reasonString || 'No reason provided',
          messagesReceived,
          wasCleanClose: code === 1000
        });
        clearTimeout(connectionTimeout);
        if (messageTimeout) clearTimeout(messageTimeout);
        clearTimeout(overallTimeout);
      });

    } catch (error) {
      console.error(`❌ [WEBSOCKET] [${wsConnectionId}] Failed to create WebSocket:`, {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : 'N/A'
      });
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
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📥 [IDEAS-API] [${requestId}] POST /api/chat/ideas - Request received`);
  console.log(`⏰ [IDEAS-API] [${requestId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`⏰ [IDEAS-API] [${requestId}] Function timeout config: maxDuration=60s`);
  console.log(`🌍 [IDEAS-API] [${requestId}] Environment: ${process.env.NODE_ENV}`);
  console.log(`🔧 [IDEAS-API] [${requestId}] Next.js version: ${process.env.npm_package_version || 'unknown'}`);

  try {
    // Step 1: Authentication
    console.log(`🔐 [IDEAS-API] [${requestId}] Step 1: Checking authentication...`);
    const authStartTime = Date.now();

    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log(`✅ [IDEAS-API] [${requestId}] Authentication successful (${Date.now() - authStartTime}ms)`);
      console.log(`👤 [IDEAS-API] [${requestId}] User ID: ${userId}`);
    } catch (authError) {
      console.error(`❌ [IDEAS-API] [${requestId}] Authentication failed:`, {
        error: authError instanceof Error ? authError.message : 'Unknown auth error',
        stack: authError instanceof Error ? authError.stack : 'N/A',
        duration: Date.now() - authStartTime
      });
      throw authError;
    }

    if (!userId) {
      console.log(`❌ [IDEAS-API] [${requestId}] No user ID returned from auth`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Parse request body
    console.log(`📦 [IDEAS-API] [${requestId}] Step 2: Parsing request body...`);
    const parseStartTime = Date.now();

    let requestData: {
      campaignId?: string;
      brandDetails?: Record<string, unknown>;
      selectedAccounts?: unknown[];
      selectedTrends?: unknown[];
    };
    try {
      requestData = await request.json();
      console.log(`✅ [IDEAS-API] [${requestId}] Request body parsed (${Date.now() - parseStartTime}ms)`);
      console.log(`📋 [IDEAS-API] [${requestId}] Request data summary:`, {
        hasCampaignId: !!requestData.campaignId,
        campaignId: requestData.campaignId,
        hasBrandDetails: !!requestData.brandDetails,
        brandDetailsKeys: requestData.brandDetails ? Object.keys(requestData.brandDetails) : [],
        brandName: requestData.brandDetails?.brand_name,
        selectedAccountsCount: Array.isArray(requestData.selectedAccounts) ? requestData.selectedAccounts.length : 0,
        selectedTrendsCount: Array.isArray(requestData.selectedTrends) ? requestData.selectedTrends.length : 0,
        requestBodySize: JSON.stringify(requestData).length
      });
    } catch (parseError) {
      console.error(`❌ [IDEAS-API] [${requestId}] Failed to parse request body:`, {
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        stack: parseError instanceof Error ? parseError.stack : 'N/A',
        duration: Date.now() - parseStartTime
      });
      throw parseError;
    }

    const { campaignId, brandDetails, selectedAccounts = [], selectedTrends = [] } = requestData;

    // Step 3: Validate required fields
    console.log(`✔️ [IDEAS-API] [${requestId}] Step 3: Validating required fields...`);
    if (!campaignId || !brandDetails) {
      console.error(`❌ [IDEAS-API] [${requestId}] Validation failed - Missing required data:`, {
        hasCampaignId: !!campaignId,
        campaignId: campaignId || 'MISSING',
        hasBrandDetails: !!brandDetails,
        brandDetailsType: typeof brandDetails,
        brandDetailsKeys: brandDetails ? Object.keys(brandDetails) : []
      });
      return NextResponse.json({
        error: 'Campaign ID and brand details are required',
        success: false,
        debug: {
          requestId,
          hasCampaignId: !!campaignId,
          hasBrandDetails: !!brandDetails
        }
      }, { status: 400 });
    }

    console.log(`✅ [IDEAS-API] [${requestId}] Validation passed`);
    console.log(`📊 [IDEAS-API] [${requestId}] Validated data:`, {
      campaignId,
      brandName: brandDetails.brand_name,
      brandOffering: brandDetails.offering,
      brandPlatform: brandDetails.platform,
      brandGoal: brandDetails.goal,
      accountsProvided: selectedAccounts.length,
      trendsProvided: selectedTrends.length
    });

    // Step 4: Create loading message in DynamoDB
    console.log(`💬 [IDEAS-API] [${requestId}] Step 4: Creating loading message in DynamoDB...`);
    const loadingMsgStartTime = Date.now();
    const loadingMessage = 'Generating creative content ideas based on the trends and competitor insights...';

    let loadingBotMessageId: string;
    try {
      loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-final-idea', undefined, true);
      console.log(`✅ [IDEAS-API] [${requestId}] Loading message created (${Date.now() - loadingMsgStartTime}ms):`, {
        messageId: loadingBotMessageId,
        campaignId,
        messageType: 'loading-final-idea',
        hasTTL: true
      });
    } catch (saveMsgError) {
      console.error(`❌ [IDEAS-API] [${requestId}] Failed to save loading message:`, {
        error: saveMsgError instanceof Error ? saveMsgError.message : 'Unknown error',
        stack: saveMsgError instanceof Error ? saveMsgError.stack : 'N/A',
        duration: Date.now() - loadingMsgStartTime,
        campaignId,
        userId
      });
      throw saveMsgError;
    }

    try {
      // Step 5: Check WebSocket URL configuration
      console.log(`🔌 [IDEAS-API] [${requestId}] Step 5: Checking WebSocket configuration...`);
      const sreveWebSocketUrl = process.env.SREVE_CREATOR_WEBSOCKET_URL;

      console.log(`🔧 [IDEAS-API] [${requestId}] Environment variables check:`, {
        hasWebSocketUrl: !!sreveWebSocketUrl,
        websocketUrlLength: sreveWebSocketUrl?.length || 0,
        websocketUrlPrefix: sreveWebSocketUrl?.substring(0, 10) || 'N/A',
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('SREVE') || key.includes('WS')).join(', ')
      });

      if (!sreveWebSocketUrl) {
        console.error(`❌ [IDEAS-API] [${requestId}] SREVE_CREATOR_WEBSOCKET_URL not configured`);
        throw new Error('SREVE_CREATOR_WEBSOCKET_URL not configured');
      }

      console.log(`✅ [IDEAS-API] [${requestId}] WebSocket URL configured`);
      console.log(`💡 [IDEAS-API] [${requestId}] Step 6: Preparing WebSocket payload...`);
      console.log(`📊 [IDEAS-API] [${requestId}] Payload details:`, {
        brand_name: brandDetails.brand_name,
        brand_offering: brandDetails.offering,
        brand_platform: brandDetails.platform,
        brand_goal: brandDetails.goal,
        brand_icp: brandDetails.icp,
        selectedAccountsCount: selectedAccounts.length,
        selectedTrendsCount: selectedTrends.length,
        hasAccounts: selectedAccounts.length > 0,
        hasTrends: selectedTrends.length > 0,
        accountsPreview: selectedAccounts.length > 0 ? {
          firstHandle: selectedAccounts[0]?.handle,
          postsCount: selectedAccounts[0]?.posts?.length
        } : null,
        trendsPreview: selectedTrends.length > 0 ? {
          firstTrend: selectedTrends[0]?.trend,
          category: selectedTrends[0]?.category
        } : null
      });

      // Step 7: Initiate WebSocket connection
      const apiCallStart = Date.now();
      const elapsedSinceStart = apiCallStart - startTime;
      console.log(`🌐 [IDEAS-API] [${requestId}] Step 7: Initiating WebSocket connection...`);
      console.log(`⏰ [IDEAS-API] [${requestId}] Time elapsed before WS call: ${elapsedSinceStart}ms`);
      console.log(`🔗 [IDEAS-API] [${requestId}] Connecting to: ${sreveWebSocketUrl}`);

      let wsResult: { success: boolean; ideaData?: unknown; error?: string };
      try {
        wsResult = await generateIdeaViaWebSocket(
          sreveWebSocketUrl,
          brandDetails,
          selectedAccounts,
          selectedTrends,
          brandDetails.format as string || ''
        );

        const apiCallDuration = Date.now() - apiCallStart;
        const totalDuration = Date.now() - startTime;

        console.log(`⏱️ [IDEAS-API] [${requestId}] WebSocket operation completed:`, {
          duration: apiCallDuration,
          totalDuration,
          success: wsResult.success,
          hasIdeaData: !!wsResult.ideaData,
          hasError: !!wsResult.error,
          errorMessage: wsResult.error || 'none'
        });

        if (!wsResult.success) {
          console.error(`❌ [IDEAS-API] [${requestId}] WebSocket operation failed:`, {
            error: wsResult.error,
            duration: apiCallDuration,
            totalDuration
          });
          throw new Error(wsResult.error || 'WebSocket operation failed');
        }

        console.log(`✅ [IDEAS-API] [${requestId}] WebSocket operation successful`);
      } catch (wsError) {
        const apiCallDuration = Date.now() - apiCallStart;
        const totalDuration = Date.now() - startTime;

        console.error(`❌ [IDEAS-API] [${requestId}] WebSocket call threw exception:`, {
          error: wsError instanceof Error ? wsError.message : 'Unknown WS error',
          errorType: wsError instanceof Error ? wsError.constructor.name : typeof wsError,
          stack: wsError instanceof Error ? wsError.stack : 'N/A',
          duration: apiCallDuration,
          totalDuration
        });
        throw wsError;
      }

      // Step 8: Parse and validate WebSocket response
      console.log(`📨 [IDEAS-API] [${requestId}] Step 8: Parsing WebSocket response...`);
      const ideaData = wsResult.ideaData as {
        selected_idea?: unknown;
        ideas?: unknown[];
        reasoning?: string;
      };

      console.log(`💡 [IDEAS-API] [${requestId}] WebSocket response structure:`, {
        hasIdeaData: !!ideaData,
        hasSelectedIdea: !!ideaData?.selected_idea,
        selectedIdeaKeys: ideaData?.selected_idea ? Object.keys(ideaData.selected_idea) : [],
        ideasCount: Array.isArray(ideaData?.ideas) ? ideaData.ideas.length : 0,
        hasReasoning: !!ideaData?.reasoning,
        reasoningLength: ideaData?.reasoning?.length || 0,
        responseSize: JSON.stringify(ideaData).length,
        topLevelKeys: ideaData ? Object.keys(ideaData) : []
      });

      // Step 9: Process and save results
      console.log(`💾 [IDEAS-API] [${requestId}] Step 9: Processing and saving results...`);

      if (ideaData?.ideas && ideaData.selected_idea) {
        console.log(`✅ [IDEAS-API] [${requestId}] Valid idea data received - proceeding with save`);
        const ideasMessage = `Excellent! I've generated creative content ideas based on the trends and competitor analysis. Here are your personalized content suggestions:`;

        // Step 9a: Save ideas results message
        console.log(`💾 [IDEAS-API] [${requestId}] Step 9a: Saving ideas results message to DynamoDB...`);
        const saveIdeaStartTime = Date.now();

        let ideasBotMessageId: string;
        try {
          ideasBotMessageId = await saveChatMessage(campaignId, userId, ideasMessage, 'bot', 'idea-preview', ideaData);
          console.log(`✅ [IDEAS-API] [${requestId}] Ideas message saved (${Date.now() - saveIdeaStartTime}ms):`, {
            messageId: ideasBotMessageId,
            messageType: 'idea-preview',
            dataSize: JSON.stringify(ideaData).length
          });
        } catch (saveError) {
          console.error(`❌ [IDEAS-API] [${requestId}] Failed to save ideas message:`, {
            error: saveError instanceof Error ? saveError.message : 'Unknown error',
            stack: saveError instanceof Error ? saveError.stack : 'N/A',
            duration: Date.now() - saveIdeaStartTime
          });
          throw saveError;
        }

        // Step 9b: Save reasoning message if exists
        let reasoningBotMessageId: string | null = null;
        if (ideaData.reasoning) {
          console.log(`💾 [IDEAS-API] [${requestId}] Step 9b: Saving reasoning message...`);
          const saveReasoningStartTime = Date.now();

          try {
            reasoningBotMessageId = await saveChatMessage(campaignId, userId, ideaData.reasoning, 'bot', 'default');
            console.log(`✅ [IDEAS-API] [${requestId}] Reasoning message saved (${Date.now() - saveReasoningStartTime}ms):`, {
              messageId: reasoningBotMessageId,
              reasoningLength: ideaData.reasoning.length
            });
          } catch (saveReasoningError) {
            console.error(`❌ [IDEAS-API] [${requestId}] Failed to save reasoning message:`, {
              error: saveReasoningError instanceof Error ? saveReasoningError.message : 'Unknown error',
              stack: saveReasoningError instanceof Error ? saveReasoningError.stack : 'N/A',
              duration: Date.now() - saveReasoningStartTime
            });
            // Don't throw - reasoning is optional
          }
        } else {
          console.log(`ℹ️ [IDEAS-API] [${requestId}] No reasoning message to save`);
        }

        // Step 9c: Delete loading message
        console.log(`🗑️ [IDEAS-API] [${requestId}] Step 9c: Deleting loading message from DynamoDB...`);
        const deleteStartTime = Date.now();

        try {
          const deleteSuccess = await deleteChatMessage(loadingBotMessageId);
          console.log(`✅ [IDEAS-API] [${requestId}] Loading message deleted (${Date.now() - deleteStartTime}ms):`, {
            messageId: loadingBotMessageId,
            deleteSuccess
          });
        } catch (deleteError) {
          console.error(`❌ [IDEAS-API] [${requestId}] Failed to delete loading message:`, {
            error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
            stack: deleteError instanceof Error ? deleteError.stack : 'N/A',
            messageId: loadingBotMessageId,
            duration: Date.now() - deleteStartTime
          });
          // Don't throw - deletion is cleanup only
        }

        const totalDuration = Date.now() - startTime;
        console.log(`🎯 [IDEAS-API] [${requestId}] SUCCESS - Flow completed in ${totalDuration}ms`);
        console.log(`📊 [IDEAS-API] [${requestId}] Final metrics:`, {
          totalDuration,
          ideasCount: Array.isArray(ideaData.ideas) ? ideaData.ideas.length : 0,
          hasReasoning: !!reasoningBotMessageId,
          messagesCreated: reasoningBotMessageId ? 2 : 1,
          messagesDeleted: 1
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
        console.warn(`⚠️ [IDEAS-API] [${requestId}] No valid idea data in response:`, {
          hasIdeas: !!ideaData?.ideas,
          hasSelectedIdea: !!ideaData?.selected_idea,
          ideaDataStructure: ideaData ? Object.keys(ideaData) : []
        });

        const noIdeasMessage = 'I was unable to generate specific content ideas at this time. However, I can still analyze what we have so far...';

        console.log(`💾 [IDEAS-API] [${requestId}] Saving no-ideas fallback message...`);
        let noIdeasBotMessageId: string;
        try {
          noIdeasBotMessageId = await saveChatMessage(campaignId, userId, noIdeasMessage, 'bot', 'default');
          console.log(`✅ [IDEAS-API] [${requestId}] No-ideas message saved:`, noIdeasBotMessageId);
        } catch (saveNoIdeasError) {
          console.error(`❌ [IDEAS-API] [${requestId}] Failed to save no-ideas message:`, {
            error: saveNoIdeasError instanceof Error ? saveNoIdeasError.message : 'Unknown error',
            stack: saveNoIdeasError instanceof Error ? saveNoIdeasError.stack : 'N/A'
          });
          throw saveNoIdeasError;
        }

        // Delete the loading message from DynamoDB
        console.log(`🗑️ [IDEAS-API] [${requestId}] Deleting loading message...`);
        try {
          await deleteChatMessage(loadingBotMessageId);
          console.log(`✅ [IDEAS-API] [${requestId}] Loading message deleted`);
        } catch (deleteError) {
          console.error(`❌ [IDEAS-API] [${requestId}] Failed to delete loading message:`, deleteError);
        }

        const totalDuration = Date.now() - startTime;
        console.log(`🎯 [IDEAS-API] [${requestId}] No-ideas response sent (${totalDuration}ms total)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      const totalDuration = Date.now() - startTime;
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(`❌ [IDEAS-API] [${requestId}] CAUGHT EXCEPTION IN TRY BLOCK`);
      console.error(`❌ [IDEAS-API] [${requestId}] Error details:`, {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorName: error instanceof Error ? error.name : 'N/A',
        stack: error instanceof Error ? error.stack : 'N/A',
        duration: totalDuration,
        timestamp: new Date().toISOString()
      });
      console.error(`❌ [IDEAS-API] [${requestId}] Configuration check:`, {
        hasWebSocketUrl: !!process.env.SREVE_CREATOR_WEBSOCKET_URL,
        hasDynamoConfig: !!(process.env.REGION_AWS && process.env.ACCESS_KEY_ID_AWS),
        environment: process.env.NODE_ENV
      });

      // Cleanup: Delete the loading message from DynamoDB
      console.log(`🗑️ [IDEAS-API] [${requestId}] Cleanup: Attempting to delete loading message...`);
      try {
        await deleteChatMessage(loadingBotMessageId);
        console.log(`✅ [IDEAS-API] [${requestId}] Loading message cleanup successful`);
      } catch (deleteError) {
        console.error(`❌ [IDEAS-API] [${requestId}] Failed to delete loading message during cleanup:`, {
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
          messageId: loadingBotMessageId
        });
      }

      console.error(`🎯 [IDEAS-API] [${requestId}] Error response being sent (${totalDuration}ms total)`);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ [IDEAS-API] [${requestId}] UNCAUGHT EXCEPTION - TOP LEVEL CATCH`);
    console.error(`❌ [IDEAS-API] [${requestId}] Fatal error details:`, {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorName: error instanceof Error ? error.name : 'N/A',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 10).join('\n') : 'N/A',
      duration: totalDuration,
      timestamp: new Date().toISOString()
    });
    console.error(`❌ [IDEAS-API] [${requestId}] System state:`, {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: false,
      error: {
        code: 'IDEAS_ERROR',
        message: 'Failed to generate ideas. Please try again.',
        type: 'api_error',
        requestId,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}