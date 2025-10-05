import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Force dynamic behavior to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

console.log('🔧 Single QuestioningSession API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `QuestioningSessions_${process.env.ENVIRONMENT}`;

// Exported function for updating questioning sessions (to be used by other APIs)
export async function updateQuestioningSessionWithAnswer(
  sessionId: string,
  userId: string,
  answer: string,
  campaignId?: string
) {
  console.log('🔄 Updating questioning session with answer:', sessionId);
  console.log('🔍 Debug - sessionId type:', typeof sessionId, 'value:', sessionId);
  console.log('🔍 Debug - userId:', userId);

  // First verify the session exists and belongs to the user
  // Try different key combinations based on table schema
  const getCommand = new GetCommand({
    TableName: TABLE_NAME,
    Key: campaignId
      ? { campaignId: campaignId, questioningSessionId: sessionId }
      : { questioningSessionId: sessionId },
  });

  const existingSession = await docClient.send(getCommand);

  if (!existingSession.Item) {
    throw new Error('Questioning session not found');
  }

  if (existingSession.Item.userId !== userId) {
    throw new Error('Unauthorized access to questioning session');
  }

  const session = existingSession.Item;

  // Check if session is active and has a current question
  if (session.status !== 'active') {
    throw new Error('Session is not active');
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];

  if (!currentQuestion) {
    throw new Error('No current question available');
  }

  // Add Q&A pair to history
  const newQAEntry = {
    question: currentQuestion,
    answer: answer,
    timestamp: new Date().toISOString()
  };

  const updatedQAHistory = [...(session.qaHistory || []), newQAEntry];
  const nextQuestionIndex = session.currentQuestionIndex + 1;

  // Determine if we're done with questions
  const isComplete = nextQuestionIndex >= session.questions.length;
  const newStatus = isComplete ? 'completed' : 'active';

  // Extend session expiration if still active
  const now = new Date();
  const newExpiresAt = isComplete ? null : new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  console.log('📝 Updating session with answer:', {
    currentQuestionIndex: session.currentQuestionIndex,
    nextQuestionIndex,
    isComplete,
    newStatus,
    newExpiresAt
  });

  const updateExpression = isComplete
    ? 'SET qaHistory = :qaHistory, currentQuestionIndex = :currentQuestionIndex, #status = :status, lastActivityAt = :lastActivityAt, updatedAt = :updatedAt REMOVE expiresAt'
    : 'SET qaHistory = :qaHistory, currentQuestionIndex = :currentQuestionIndex, #status = :status, expiresAt = :expiresAt, lastActivityAt = :lastActivityAt, updatedAt = :updatedAt';

  const expressionAttributeValues: Record<string, unknown> = {
    ':qaHistory': updatedQAHistory,
    ':currentQuestionIndex': nextQuestionIndex,
    ':status': newStatus,
    ':lastActivityAt': now.toISOString(),
    ':updatedAt': now.toISOString(),
  };

  if (!isComplete && newExpiresAt) {
    expressionAttributeValues[':expiresAt'] = newExpiresAt;
  }

  const updateCommand = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: campaignId
      ? { campaignId: campaignId, questioningSessionId: sessionId }
      : { questioningSessionId: sessionId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(updateCommand);
  console.log('✅ Questioning session updated successfully:', sessionId);

  return {
    success: true,
    session: result.Attributes,
    isComplete: isComplete,
    nextQuestion: isComplete ? null : session.questions[nextQuestionIndex],
    message: isComplete ? 'All questions completed' : 'Answer recorded, next question available'
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  console.log('📥 PUT /api/questioning-sessions/[sessionId] - Update questioning session request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    console.log('🔄 Updating questioning session:', sessionId);

    const body = await request.json();
    const { answer, status } = body;

    console.log('📝 Update data received:', { sessionId, answer, status });

    // First verify the session exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { questioningSessionId: sessionId },
    });

    const existingSession = await docClient.send(getCommand);

    if (!existingSession.Item) {
      console.log('❌ Questioning session not found:', sessionId);
      return NextResponse.json({ error: 'Questioning session not found' }, { status: 404 });
    }

    if (existingSession.Item.userId !== userId) {
      console.log('❌ Unauthorized update attempt on questioning session:', sessionId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If providing an answer, add it to qaHistory and move to next question
    if (answer) {
      try {
        const result = await updateQuestioningSessionWithAnswer(sessionId, userId, answer);
        return NextResponse.json(result);
      } catch (error) {
        console.error('❌ Error updating session with answer:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update session';
        return NextResponse.json({ error: errorMessage, success: false }, { status: 400 });
      }
    }

    // If just updating status
    if (status) {
      console.log('📝 Updating session status to:', status);

      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { questioningSessionId: sessionId },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      });

      const result = await docClient.send(updateCommand);
      console.log('✅ Questioning session status updated successfully:', sessionId);

      return NextResponse.json({
        success: true,
        session: result.Attributes,
        message: 'Session status updated successfully'
      });
    }

    return NextResponse.json({
      error: 'No update data provided',
      success: false
    }, { status: 400 });

  } catch (error: unknown) {
    console.error('❌ Error in PUT /api/questioning-sessions/[sessionId]:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  console.log('🗑️ DELETE /api/questioning-sessions/[sessionId] - Delete questioning session request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    console.log('🗑️ Deleting questioning session:', sessionId);

    // First verify the session exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { questioningSessionId: sessionId },
    });

    const existingSession = await docClient.send(getCommand);

    if (!existingSession.Item) {
      console.log('❌ Questioning session not found:', sessionId);
      return NextResponse.json({ error: 'Questioning session not found' }, { status: 404 });
    }

    if (existingSession.Item.userId !== userId) {
      console.log('❌ Unauthorized deletion attempt on questioning session:', sessionId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the session
    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { questioningSessionId: sessionId },
    });

    await docClient.send(deleteCommand);
    console.log('✅ Questioning session deleted successfully:', sessionId);

    return NextResponse.json({
      success: true,
      message: 'Questioning session deleted successfully'
    });

  } catch (error: unknown) {
    console.error('❌ Error in DELETE /api/questioning-sessions/[sessionId]:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  console.log('📥 GET /api/questioning-sessions/[sessionId] - Get single questioning session request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    console.log('🔍 Fetching questioning session:', sessionId);

    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { questioningSessionId: sessionId },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      console.log('❌ Questioning session not found:', sessionId);
      return NextResponse.json({ error: 'Questioning session not found' }, { status: 404 });
    }

    // Check if session belongs to user
    if (result.Item.userId !== userId) {
      console.log('❌ Unauthorized access to questioning session:', sessionId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('✅ Questioning session found:', sessionId);
    return NextResponse.json({
      session: result.Item,
      success: true
    });

  } catch (error) {
    console.error('❌ Error in GET /api/questioning-sessions/[sessionId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}