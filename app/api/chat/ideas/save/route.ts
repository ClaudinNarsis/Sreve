import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Ideas Save API endpoint loaded');

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
async function saveChatMessage(
  campaignId: string,
  userId: string,
  message: string,
  sender: 'user' | 'bot',
  messageType?: string,
  ideaData?: unknown
) {
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
  };

  try {
    const putCommand = new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: messageData,
    });

    await docClient.send(putCommand);
    console.log(`✅ [SAVE-API] ${sender} message stored:`, messageId);
    return messageId;
  } catch (error) {
    console.error(`❌ [SAVE-API] Failed to save ${sender} message:`, error);
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
    console.log(`✅ [SAVE-API] Message deleted:`, messageId);
    return true;
  } catch (error) {
    console.error(`❌ [SAVE-API] Failed to delete message:`, error);
    return false;
  }
}

export const maxDuration = 10; // Short timeout - just saving to DB
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📥 [SAVE-API] [${requestId}] POST /api/chat/ideas/save`);

  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      console.log(`❌ [SAVE-API] [${requestId}] Unauthorized`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { campaignId, ideaData, loadingMessageId } = await request.json();

    console.log(`📋 [SAVE-API] [${requestId}] Request:`, {
      campaignId,
      hasIdeaData: !!ideaData,
      loadingMessageId,
      userId
    });

    if (!campaignId || !ideaData) {
      console.error(`❌ [SAVE-API] [${requestId}] Missing required fields`);
      return NextResponse.json({
        error: 'Campaign ID and idea data are required',
        success: false
      }, { status: 400 });
    }

    // Save ideas message
    const ideasMessage = `Excellent! I've generated creative content ideas based on the trends and competitor analysis. Here are your personalized content suggestions:`;

    console.log(`💾 [SAVE-API] [${requestId}] Saving ideas message...`);
    const ideasBotMessageId = await saveChatMessage(
      campaignId,
      userId,
      ideasMessage,
      'bot',
      'idea-preview',
      ideaData
    );

    // Save reasoning message if exists
    let reasoningBotMessageId: string | null = null;
    if (ideaData.reasoning) {
      console.log(`💾 [SAVE-API] [${requestId}] Saving reasoning message...`);
      reasoningBotMessageId = await saveChatMessage(
        campaignId,
        userId,
        ideaData.reasoning,
        'bot',
        'default'
      );
    }

    // Delete loading message if provided
    if (loadingMessageId) {
      console.log(`🗑️ [SAVE-API] [${requestId}] Deleting loading message...`);
      await deleteChatMessage(loadingMessageId);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [SAVE-API] [${requestId}] Success (${duration}ms)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      ideasBotMessageId,
      reasoningBotMessageId,
      nextStep: 'critique', // Signal to continue to critique
      message: 'Ideas saved successfully'
    }, { status: 200 });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [SAVE-API] [${requestId}] Error (${duration}ms):`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A'
    });
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: false,
      error: 'Failed to save ideas to database'
    }, { status: 500 });
  }
}
