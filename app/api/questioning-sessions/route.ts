import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic behavior to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

console.log('🔧 QuestioningSessions API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `QuestioningSessions_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB QuestioningSessions table name:', TABLE_NAME);

// Exported function for creating questioning sessions (to be used by other APIs)
export async function createQuestioningSession(
  campaignId: string,
  userId: string,
  originalPrompt: string,
  questions: string[]
) {
  console.log('🔄 Creating questioning session for campaign:', campaignId);

  // Check for existing active session for this campaign
  console.log('🔍 Checking for existing active session for campaign:', campaignId);
  const scanCommand = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'campaignId = :campaignId AND userId = :userId AND #status = :status',
    ExpressionAttributeValues: {
      ':campaignId': campaignId,
      ':userId': userId,
      ':status': 'active'
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  });

  const existingResult = await docClient.send(scanCommand);
  if (existingResult.Items && existingResult.Items.length > 0) {
    console.log('⚠️ Active session already exists, marking as abandoned');
    // Mark existing session as abandoned
    for (const item of existingResult.Items) {
      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { questioningSessionId: item.questioningSessionId },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'abandoned',
          ':updatedAt': new Date().toISOString()
        }
      });
      await docClient.send(updateCommand);
    }
  }

  // Generate unique session ID
  const questioningSessionId = uuidv4();
  console.log('🆔 Generated questioning session ID:', questioningSessionId);

  // Prepare session data
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

  const sessionData = {
    questioningSessionId,
    campaignId,
    userId,
    originalPrompt,
    questions,
    qaHistory: [],
    currentQuestionIndex: 0,
    status: 'active',
    expiresAt: expiresAt.toISOString(),
    lastActivityAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  console.log('💾 Attempting to save questioning session to DynamoDB');

  const putCommand = new PutCommand({
    TableName: TABLE_NAME,
    Item: sessionData,
    ConditionExpression: 'attribute_not_exists(questioningSessionId)',
  });

  await docClient.send(putCommand);
  console.log('✅ Questioning session created in DynamoDB successfully');

  return {
    message: 'Questioning session created successfully',
    session: {
      questioningSessionId,
      campaignId,
      userId,
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      status: 'active',
      createdAt: sessionData.createdAt
    },
    success: true
  };
}

export async function POST(request: NextRequest) {
  console.log('📥 POST /api/questioning-sessions - Create questioning session request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 Request data received:', requestData);

    const {
      campaignId,
      originalPrompt,
      questions
    } = requestData;

    if (!campaignId || !originalPrompt || !questions || !Array.isArray(questions)) {
      console.log('❌ Missing required data');
      return NextResponse.json({
        error: 'Campaign ID, original prompt, and questions array are required',
        success: false
      }, { status: 400 });
    }

    // Use the extracted function
    const result = await createQuestioningSession(campaignId, userId, originalPrompt, questions);

    return NextResponse.json(result, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Error in POST /api/questioning-sessions:', error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create questioning session. Please try again.',
      success: false
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 GET /api/questioning-sessions - Get questioning session request received');

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

    console.log('🔍 Fetching active questioning session for campaign:', campaignId);

    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'campaignId = :campaignId AND userId = :userId AND #status = :status',
      ExpressionAttributeValues: {
        ':campaignId': campaignId,
        ':userId': userId,
        ':status': 'active'
      },
      ExpressionAttributeNames: {
        '#status': 'status'
      }
    });

    const result = await docClient.send(scanCommand);
    console.log('📋 Questioning sessions found:', result.Items?.length || 0);

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json({
        session: null,
        success: true
      });
    }

    const session = result.Items[0]; // Should only be one active session per campaign
    return NextResponse.json({
      session,
      success: true
    });

  } catch (error) {
    console.error('❌ Error in GET /api/questioning-sessions:', error);
    return NextResponse.json({
      error: 'Failed to fetch questioning session',
      success: false
    }, { status: 500 });
  }
}