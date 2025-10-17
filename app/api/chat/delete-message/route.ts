import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

console.log('🔧 Chat Delete Message API endpoint loaded');

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
  console.log('📥 POST /api/chat/delete-message - Delete message request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();
    console.log('🆔 Message ID to delete:', messageId);

    if (!messageId) {
      console.log('❌ Missing message ID');
      return NextResponse.json({
        error: 'Message ID is required',
        success: false
      }, { status: 400 });
    }

    // Delete message from DynamoDB
    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { chatMessageId: messageId },
    });

    console.log('🗑️ Attempting to delete from DynamoDB...');
    await docClient.send(deleteCommand);
    console.log(`✅ Message ${messageId} deleted from DynamoDB`);

    return NextResponse.json({
      message: 'Message deleted successfully',
      success: true
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('❌ Error in POST /api/chat/delete-message:', error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete message. Please try again.',
      success: false
    }, { status: 500 });
  }
}
