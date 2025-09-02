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
  console.log('📥 POST /api/generate - Chat generation request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 Request data:', requestData);
    
    const { campaignId, userMessage } = requestData;

    if (!campaignId || !userMessage) {
      console.log('❌ Missing required data:', { campaignId: !!campaignId, userMessage: !!userMessage });
      return NextResponse.json({ 
        error: 'Campaign ID and user message are required',
        success: false 
      }, { status: 400 });
    }

    // Generate unique message ID
    const messageId = uuidv4();
    console.log('🆔 Generated message ID:', messageId);

    // Store user message
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
    console.log('✅ User message stored in DynamoDB');

    // Call SREVE_CREATOR_API_ENDPOINT
    const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
    console.log('🔗 SREVE Creator API endpoint from env:', sreveApiEndpoint);
    console.log('🔗 All environment variables:', Object.keys(process.env).filter(key => key.includes('SREVE')));

    if (!sreveApiEndpoint) {
      console.error('❌ SREVE_CREATOR_API_ENDPOINT environment variable not found');
      throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
    }

    // Construct the full URL with /generate endpoint
    const apiUrl = `${sreveApiEndpoint}/generate`;
    console.log('🌐 Calling API URL:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userMessage,
        campaignId: campaignId,
        userId: userId
      }),
    });

    console.log('📡 SREVE API response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ SREVE API error:', errorText);
      throw new Error(`SREVE API responded with status: ${apiResponse.status} - ${errorText}`);
    }

    const apiResult = await apiResponse.json();
    console.log('📥 SREVE API Response received successfully');

    // Store bot response with full API result
    const botMessageId = uuidv4();
    const botMessageData = {
      chatMessageId: botMessageId, // Primary key expected by DynamoDB
      campaignId,
      userId,
      message: apiResult?.result?.chat?.thinking || 'AI Response Generated',
      sender: 'bot',
      apiResponse: apiResult,
      timestamp: new Date().toISOString(), // Adding timestamp field
      createdAt: new Date().toISOString(),
    };

    const putBotMessageCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: botMessageData,
    });

    await docClient.send(putBotMessageCommand);
    console.log('✅ Bot response stored in DynamoDB');

    return NextResponse.json({ 
      message: 'Chat processed successfully',
      userMessageId: messageId,
      botMessageId: botMessageId,
      apiResponse: apiResult,
      success: true
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error in POST /api/generate:', error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to process chat message. Please try again.',
      success: false 
    }, { status: 500 });
  }
}