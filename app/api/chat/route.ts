import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat API endpoint loaded');

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
  console.log('📥 POST /api/chat - Chat message request received');
  
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
    console.log('🔗 Calling SREVE Creator API:', sreveApiEndpoint);

    if (!sreveApiEndpoint) {
      throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
    }

    const apiResponse = await fetch(sreveApiEndpoint, {
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

    if (!apiResponse.ok) {
      throw new Error(`SREVE API responded with status: ${apiResponse.status}`);
    }

    const apiResult = await apiResponse.json();
    console.log('📥 SREVE API Response received');

    // Store bot response with full API result
    const botMessageId = uuidv4();
    const botMessageData = {
      chatMessageId: botMessageId, // Primary key expected by DynamoDB
      campaignId,
      userId,
      message: 'AI Response Generated',
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

  } catch (error: unknown) {
    console.error('❌ Error in POST /api/chat:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process chat message. Please try again.',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 GET /api/chat - Chat messages fetch request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ 
        error: 'Campaign ID is required',
        success: false 
      }, { status: 400 });
    }

    console.log('🔍 Fetching chat messages for campaign:', campaignId);
    
    try {
      const scanCommand = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'campaignId = :campaignId AND userId = :userId',
        ExpressionAttributeValues: {
          ':campaignId': campaignId,
          ':userId': userId
        }
      });

      const result = await docClient.send(scanCommand);
      console.log('📋 Chat messages found:', result.Items?.length || 0);
      
      // Sort by createdAt ascending (chronological order)
      const sortedMessages = (result.Items || []).sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return NextResponse.json({ 
        messages: sortedMessages,
        success: true 
      });

    } catch (error) {
      console.error('❌ Error fetching chat messages for campaign:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch chat messages',
        messages: [],
        success: false 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in GET /api/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}