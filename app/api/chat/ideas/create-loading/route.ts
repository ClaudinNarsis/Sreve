import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const CHAT_MESSAGES_TABLE = `ChatMessages_${process.env.ENVIRONMENT}`;

export const maxDuration = 5;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await request.json();
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Create loading message with TTL
    const messageId = uuidv4();
    const messageData = {
      chatMessageId: messageId,
      campaignId,
      userId,
      message: 'Generating creative content ideas based on the trends and competitor insights...',
      sender: 'bot',
      messageType: 'loading-final-idea',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes
    };

    await docClient.send(new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: messageData,
    }));

    console.log(`✅ [CREATE-LOADING] Created loading message: ${messageId}`);

    return NextResponse.json({
      success: true,
      loadingMessageId: messageId
    }, { status: 200 });

  } catch (error) {
    console.error('❌ [CREATE-LOADING] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create loading message'
    }, { status: 500 });
  }
}
