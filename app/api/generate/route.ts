import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Generate API endpoint loaded');
console.log('🔧 Environment check - SREVE_CREATOR_API_ENDPOINT:', process.env.SREVE_CREATOR_API_ENDPOINT);

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `ChatMessages_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB ChatMessages table name:', TABLE_NAME);

export async function POST(request: NextRequest) {
  console.log('🎯 [API-GENERATE] POST /api/generate - Chat generation request received');
  
  try {
    const { userId } = await auth();
    console.log('🎯 [API-GENERATE] Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('🎯 [API-GENERATE] ❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('🎯 [API-GENERATE] Request data:', requestData);
    
    const { campaignId, userMessage } = requestData;

    if (!campaignId || !userMessage) {
      console.log('🎯 [API-GENERATE] ❌ Missing required data:', { campaignId: !!campaignId, userMessage: !!userMessage });
      return NextResponse.json({ 
        error: 'Campaign ID and user message are required',
        success: false 
      }, { status: 400 });
    }

    // Generate unique message ID
    const messageId = uuidv4();
    console.log('🎯 [API-GENERATE] Generated message ID:', messageId);

    // Store user message
    console.log('🎯 [API-GENERATE] Storing user message in DynamoDB...');
    const userMessageData = {
      chatMessageId: messageId, // Primary key expected by DynamoDB
      campaignId,
      userId,
      message: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString(), // Adding timestamp field
      createdAt: new Date().toISOString(),
    };

    const putUserMessageCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: userMessageData,
    });

    await docClient.send(putUserMessageCommand);
    console.log('🎯 [API-GENERATE] ✅ User message stored in DynamoDB');

    // Call SREVE_CREATOR_API_ENDPOINT
    console.log('🎯 [API-GENERATE] Preparing to call SREVE Creator API...');
    const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
    console.log('🎯 [API-GENERATE] SREVE Creator API endpoint from env:', sreveApiEndpoint);
    console.log('🎯 [API-GENERATE] All SREVE environment variables:', Object.keys(process.env).filter(key => key.includes('SREVE')));

    if (!sreveApiEndpoint) {
      console.error('🎯 [API-GENERATE] ❌ SREVE_CREATOR_API_ENDPOINT environment variable not found');
      throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
    }

    // Construct the full URL with /generate endpoint
    const apiUrl = `${sreveApiEndpoint}/generate`;
    console.log('🎯 [API-GENERATE] Calling API URL:', apiUrl);
    console.log('🎯 [API-GENERATE] Request payload:', {
      query: userMessage,
      campaignId: campaignId,
      userId: userId
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        console.log('🎯 [API-GENERATE] Starting streaming request...');
        
        try {
          const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: userMessage,
              preferred_format: 'Instagram Post', // Add default format
              topic_hint: userMessage
            }),
          });

          console.log('🎯 [API-GENERATE] SREVE API response status:', apiResponse.status);

          if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('🎯 [API-GENERATE] ❌ SREVE API error:', errorText);
            controller.enqueue(`data: ${JSON.stringify({ 
              step: 'error', 
              error: `SREVE API responded with status: ${apiResponse.status} - ${errorText}` 
            })}\n\n`);
            controller.close();
            return;
          }

          if (!apiResponse.body) {
            controller.enqueue(`data: ${JSON.stringify({ 
              step: 'error', 
              error: 'No response body received from SREVE API' 
            })}\n\n`);
            controller.close();
            return;
          }

          const reader = apiResponse.body.getReader();
          const decoder = new TextDecoder();
          let finalResult: any = null;
          
          // Send initial status to client
          controller.enqueue(`data: ${JSON.stringify({ 
            step: 'connected', 
            message: 'Connected to SREVE API, starting generation...',
            userMessageId: messageId 
          })}\n\n`);

          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                console.log('🎯 [API-GENERATE] Stream ended');
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                  const dataStr = line.slice(6); // Remove "data: " prefix
                  
                  try {
                    const parsed = JSON.parse(dataStr);
                    console.log(`🎯 [API-GENERATE] Streaming step: ${parsed.step} - ${parsed.message || 'no message'}`);
                    
                    // Forward the streaming data to the client
                    controller.enqueue(`data: ${JSON.stringify(parsed)}\n\n`);
                    
                    // Check if this is the final result
                    if (parsed.step === 'complete' && parsed.result) {
                      finalResult = parsed.result;
                      console.log('🎯 [API-GENERATE] ✅ Final result received');
                    } else if (parsed.step === 'error') {
                      console.error('🎯 [API-GENERATE] ❌ Stream error:', parsed.error);
                      controller.close();
                      return;
                    }
                  } catch (parseError) {
                    console.error('🎯 [API-GENERATE] ❌ Error parsing streaming data:', parseError);
                    // Continue processing other lines
                  }
                }
              }
            }

            // Store the final result in DynamoDB if we received one
            if (finalResult) {
              console.log('🎯 [API-GENERATE] Storing final bot response in DynamoDB...');
              const botMessageId = uuidv4();
              const botMessageData = {
                chatMessageId: botMessageId,
                campaignId,
                userId,
                message: finalResult?.chat?.thinking || 'AI Response Generated',
                sender: 'bot',
                apiResponse: { result: finalResult },
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              };

              const putBotMessageCommand = new PutCommand({
                TableName: TABLE_NAME,
                Item: botMessageData,
              });

              await docClient.send(putBotMessageCommand);
              console.log('🎯 [API-GENERATE] ✅ Final bot response stored in DynamoDB');

              // Send final completion message with botMessageId
              controller.enqueue(`data: ${JSON.stringify({ 
                step: 'stored', 
                message: 'Response saved successfully',
                botMessageId: botMessageId,
                success: true 
              })}\n\n`);
            }

            controller.close();

          } catch (streamError) {
            console.error('🎯 [API-GENERATE] ❌ Stream reading error:', streamError);
            controller.enqueue(`data: ${JSON.stringify({ 
              step: 'error', 
              error: `Stream reading error: ${streamError.message}` 
            })}\n\n`);
            controller.close();
          }

        } catch (error: any) {
          console.error('🎯 [API-GENERATE] ❌ Error in streaming setup:', error);
          controller.enqueue(`data: ${JSON.stringify({ 
            step: 'error', 
            error: error.message || 'Failed to connect to SREVE API' 
          })}\n\n`);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('❌ Error in POST /api/generate:', error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to process chat message. Please try again.',
      success: false 
    }, { status: 500 });
  }
}