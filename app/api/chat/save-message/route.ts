import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Save Message API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const TABLE_NAME = `ChatMessages_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB ChatMessages table name:', TABLE_NAME);

export async function POST(request: NextRequest) {
  console.log('📥 POST /api/chat/save-message - Save individual message request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 Request data:', requestData);
    
    const { campaignId, message } = requestData;

    if (!campaignId || !message) {
      console.log('❌ Missing required data:', { campaignId: !!campaignId, message: !!message });
      return NextResponse.json({ 
        error: 'Campaign ID and message are required',
        success: false 
      }, { status: 400 });
    }

    // Generate unique message ID if not provided
    const messageId = message.id || uuidv4();
    console.log('🆔 Using message ID:', messageId);

    // Store message in DynamoDB format
    const messageData: {
      chatMessageId: string;
      campaignId: string;
      userId: string;
      message: string;
      sender: string;
      timestamp: string;
      createdAt: string;
      messageType?: string;
      apiResponse?: unknown;
      questions?: string[];
      trendData?: unknown;
      accountsData?: unknown;
      ideaData?: unknown;
      critiqueData?: unknown;
    } = {
      chatMessageId: messageId, // Primary key expected by DynamoDB
      campaignId,
      userId,
      message: message.text,
      sender: message.sender,
      timestamp: new Date(message.timestamp).toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Add messageType if provided
    if (message.messageType) {
      messageData.messageType = message.messageType;
    }

    // Add questions if provided (for critique-questions messages)
    if (message.questions && Array.isArray(message.questions)) {
      console.log('📋 Adding questions to messageData:', message.questions);
      messageData.questions = message.questions;
    }

    // Add data fields if provided
    if (message.trendData) {
      messageData.trendData = message.trendData;
    }
    if (message.accountsData) {
      messageData.accountsData = message.accountsData;
    }
    if (message.ideaData) {
      messageData.ideaData = message.ideaData;
    }
    if (message.critiqueData) {
      messageData.critiqueData = message.critiqueData;
    }

    // Add apiResponse if it's a bot message with results
    if (message.sender === 'bot' && message.apiResponse) {
      console.log('📊 Adding apiResponse to messageData:', message.apiResponse);
      messageData.apiResponse = message.apiResponse;
    }

    console.log('📋 Final messageData to be stored:', JSON.stringify(messageData, null, 2));

    const putMessageCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: messageData,
    });

    console.log('💾 Attempting to store in DynamoDB...');
    const result = await docClient.send(putMessageCommand);
    console.log('📥 DynamoDB put result:', result);
    console.log(`✅ ${message.sender} message stored in DynamoDB`);

    return NextResponse.json({ 
      message: 'Message saved successfully',
      messageId: messageId,
      success: true
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Error in POST /api/chat/save-message:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save message. Please try again.',
      success: false 
    }, { status: 500 });
  }
}