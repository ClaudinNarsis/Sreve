// Client-side WebSocket handler for idea generation
// This bypasses the API route to avoid serverless timeout limits

interface IdeaData {
  ideas: Array<{
    angle: string;
    description: string;
  }>;
  reasoning: string;
}

interface WebSocketIdeaResult {
  success: boolean;
  ideaData?: IdeaData;
  error?: string;
}

export async function generateIdeasViaWebSocket(
  websocketUrl: string,
  brandDetails: Record<string, unknown>,
  selectedAccounts: unknown[],
  selectedTrends: unknown[],
  prompt: string
): Promise<WebSocketIdeaResult> {
  return new Promise((resolve) => {
    const connectionId = `client_ws_${Date.now()}`;
    console.log(`🔌 [CLIENT-WS] [${connectionId}] Connecting to WebSocket...`);

    try {
      const ws = new WebSocket(websocketUrl);

      let messagesReceived = 0;
      const startTime = Date.now();

      // Overall timeout (120 seconds)
      const overallTimeout = setTimeout(() => {
        console.error(`❌ [CLIENT-WS] [${connectionId}] Timeout after 120s`);
        ws.close();
        resolve({
          success: false,
          error: 'Idea generation timed out after 120 seconds'
        });
      }, 120000);

      // Connection timeout (10 seconds)
      const connectionTimeout = setTimeout(() => {
        console.error(`❌ [CLIENT-WS] [${connectionId}] Connection timeout`);
        ws.close();
        resolve({
          success: false,
          error: 'Failed to connect to WebSocket within 10 seconds'
        });
      }, 10000);

      let messageTimeout: NodeJS.Timeout | undefined;

      ws.onopen = () => {
        console.log(`✅ [CLIENT-WS] [${connectionId}] Connected (${Date.now() - startTime}ms)`);
        clearTimeout(connectionTimeout);

        const request = {
          action: "generateIdea",
          brand_details: brandDetails,
          selected_accounts: selectedAccounts,
          selected_trends: selectedTrends,
          prompt: prompt
        };

        console.log(`📤 [CLIENT-WS] [${connectionId}] Sending request:`, {
          action: request.action,
          brandName: brandDetails.brand_name,
          accountsCount: selectedAccounts.length,
          trendsCount: selectedTrends.length
        });

        ws.send(JSON.stringify(request));

        // Message timeout (45 seconds after connection)
        messageTimeout = setTimeout(() => {
          console.error(`❌ [CLIENT-WS] [${connectionId}] No response after 45s`);
          ws.close();
          resolve({
            success: false,
            error: 'No response received within 45 seconds'
          });
        }, 45000);
      };

      ws.onmessage = (event) => {
        messagesReceived++;

        try {
          const data = JSON.parse(event.data);
          console.log(`📨 [CLIENT-WS] [${connectionId}] Message #${messagesReceived}:`, data.type);
          console.log(`📦 [CLIENT-WS] [${connectionId}] RAW message data:`, JSON.stringify(data, null, 2));

          switch (data.type) {
            case 'connected':
              console.log(`✅ [CLIENT-WS] [${connectionId}] Connection confirmed`);
              break;

            case 'progress':
              console.log(`⏳ [CLIENT-WS] [${connectionId}] Progress:`, data.stage);
              // Reset message timeout
              if (messageTimeout) clearTimeout(messageTimeout);
              messageTimeout = setTimeout(() => {
                console.error(`❌ [CLIENT-WS] [${connectionId}] Timeout during ${data.stage}`);
                ws.close();
                resolve({
                  success: false,
                  error: 'Operation timed out during processing'
                });
              }, 45000);
              break;

            case 'complete':
              console.log(`🎉 [CLIENT-WS] [${connectionId}] Complete (${Date.now() - startTime}ms total)`);
              console.log(`📊 [CLIENT-WS] [${connectionId}] Response structure:`, {
                ideasCount: Array.isArray(data.ideas) ? data.ideas.length : 0,
                hasReasoning: !!data.reasoning
              });

              if (messageTimeout) clearTimeout(messageTimeout);
              clearTimeout(overallTimeout);
              ws.close();

              // NEW API STRUCTURE:
              // Returns: { ideas: [{ angle, description }], reasoning, count }
              // Map to format expected by frontend (angle, description)
              const mappedIdeas = Array.isArray(data.ideas)
                ? data.ideas.map((idea: { angle: string; description: string }) => ({
                    angle: idea.angle,
                    description: idea.description
                  }))
                : [];

              console.log(`🔄 [CLIENT-WS] [${connectionId}] Mapped ${mappedIdeas.length} ideas`);

              resolve({
                success: true,
                ideaData: {
                  ideas: mappedIdeas,
                  reasoning: data.reasoning || 'Generated creative ideas based on trends and competitor insights.'
                }
              });
              break;

            case 'error':
              console.error(`❌ [CLIENT-WS] [${connectionId}] Error:`, data.message);

              if (messageTimeout) clearTimeout(messageTimeout);
              clearTimeout(overallTimeout);
              ws.close();

              resolve({
                success: false,
                error: data.message || 'WebSocket error occurred'
              });
              break;

            default:
              console.warn(`⚠️ [CLIENT-WS] [${connectionId}] Unknown message type:`, data.type);
          }
        } catch (parseError) {
          console.error(`❌ [CLIENT-WS] [${connectionId}] Parse error:`, parseError);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ [CLIENT-WS] [${connectionId}] Connection error:`, error);
        clearTimeout(connectionTimeout);
        if (messageTimeout) clearTimeout(messageTimeout);
        clearTimeout(overallTimeout);

        resolve({
          success: false,
          error: 'WebSocket connection error'
        });
      };

      ws.onclose = (event) => {
        console.log(`🔌 [CLIENT-WS] [${connectionId}] Closed:`, event.code);
        clearTimeout(connectionTimeout);
        if (messageTimeout) clearTimeout(messageTimeout);
        clearTimeout(overallTimeout);
      };

    } catch (error) {
      console.error(`❌ [CLIENT-WS] [${connectionId}] Failed to create WebSocket:`, error);
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create WebSocket'
      });
    }
  });
}
