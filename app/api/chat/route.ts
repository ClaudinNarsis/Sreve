/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { createQuestioningSession } from '../questioning-sessions/route';
import { updateQuestioningSessionWithAnswer } from '../questioning-sessions/[sessionId]/route';

console.log('🔧 Chat API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const CHAT_MESSAGES_TABLE = `ChatMessages_${process.env.ENVIRONMENT}`;
const QUESTIONING_SESSIONS_TABLE = `QuestioningSessions_${process.env.ENVIRONMENT}`;
const PROJECTS_TABLE = `Projects_${process.env.ENVIRONMENT}`;
const CAMPAIGNS_TABLE = `Campaigns_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB table names:', {
  chatMessages: CHAT_MESSAGES_TABLE,
  questioningSessions: QUESTIONING_SESSIONS_TABLE,
  projects: PROJECTS_TABLE,
  campaigns: CAMPAIGNS_TABLE
});

// Debug environment variables in development
if (process.env.ENVIRONMENT === 'Dev') {
  console.log('🔧 Environment variables debug:', {
    ENVIRONMENT: process.env.ENVIRONMENT,
    SREVE_CREATOR_API_ENDPOINT: process.env.SREVE_CREATOR_API_ENDPOINT,
    SREVE_CREATOR_HEALTHCHECK_ENDPOINT: process.env.SREVE_CREATOR_HEALTHCHECK_ENDPOINT,
    REGION_AWS: process.env.REGION_AWS,
    NODE_ENV: process.env.NODE_ENV,
    // Don't log sensitive variables, just check if they exist
    ACCESS_KEY_ID_AWS_EXISTS: !!process.env.ACCESS_KEY_ID_AWS,
    SECRET_ACCESS_KEY_AWS_EXISTS: !!process.env.SECRET_ACCESS_KEY_AWS,
    CLERK_SECRET_KEY_EXISTS: !!process.env.CLERK_SECRET_KEY,
    allEnvKeys: Object.keys(process.env).filter(key =>
      key.includes('SREVE') ||
      key.includes('AWS') ||
      key.includes('CLERK') ||
      key === 'ENVIRONMENT' ||
      key === 'NODE_ENV'
    )
  });
}

// Custom error classes for better error handling
class QuestioningSessionError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'QuestioningSessionError';
  }
}

class ExtractPromptAPIError extends Error {
  constructor(message: string, public statusCode: number, public originalError?: unknown) {
    super(message);
    this.name = 'ExtractPromptAPIError';
  }
}

class DatabaseOperationError extends Error {
  constructor(message: string, public operation: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseOperationError';
  }
}

class SessionRecoveryError extends Error {
  constructor(message: string, public sessionId: string) {
    super(message);
    this.name = 'SessionRecoveryError';
  }
}

// Circuit breaker implementation for external API calls
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 3,
    private timeout: number = 60000, // 1 minute
    private resetTime: number = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTime) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker moving to HALF_OPEN state');
      } else {
        throw new ExtractPromptAPIError(
          'Circuit breaker is OPEN - external API temporarily unavailable',
          503
        );
      }
    }

    try {
      const result = await operation();

      if (this.state === 'HALF_OPEN') {
        this.reset();
        console.log('✅ Circuit breaker reset to CLOSED state');
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.log(`🚨 Circuit breaker OPEN after ${this.failures} failures`);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }

  getState(): string {
    return this.state;
  }
}

// Global circuit breaker instance for external API
const extractPromptCircuitBreaker = new CircuitBreaker(3, 60000, 30000);

// Helper function to check session expiration
function isSessionExpired(session: Record<string, unknown>): boolean {
  if (!session.expiresAt || typeof session.expiresAt !== 'string') return false;
  return new Date() > new Date(session.expiresAt);
}

// Helper function to check if session is recoverable (expired but within 24 hours)
function isSessionRecoverable(session: Record<string, unknown>): boolean {
  if (!session.lastActivityAt || typeof session.lastActivityAt !== 'string') return false;
  const lastActivity = new Date(session.lastActivityAt);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return lastActivity > twentyFourHoursAgo;
}

// Helper function to check for active questioning session
async function getActiveQuestioningSession(campaignId: string, userId: string) {
  const scanCommand = new ScanCommand({
    TableName: QUESTIONING_SESSIONS_TABLE,
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
  const session = result.Items && result.Items.length > 0 ? result.Items[0] : null;

  if (session && isSessionExpired(session)) {
    console.log('🕐 Session expired, marking as expired');
    // Mark session as expired
    await updateQuestioningSessionStatus(session.questioningSessionId, 'expired');
    return null;
  }

  return session;
}

// Helper function to check for recoverable sessions
async function getRecoverableSession(campaignId: string, userId: string) {
  const scanCommand = new ScanCommand({
    TableName: QUESTIONING_SESSIONS_TABLE,
    FilterExpression: 'campaignId = :campaignId AND userId = :userId AND (#status = :expiredStatus OR #status = :abandonedStatus)',
    ExpressionAttributeValues: {
      ':campaignId': campaignId,
      ':userId': userId,
      ':expiredStatus': 'expired',
      ':abandonedStatus': 'abandoned'
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  });

  const result = await docClient.send(scanCommand);
  if (!result.Items || result.Items.length === 0) return null;

  // Find the most recent recoverable session
  const recoverableSessions = result.Items.filter(isSessionRecoverable);
  if (recoverableSessions.length === 0) return null;

  // Sort by lastActivityAt descending and return the most recent
  return recoverableSessions.sort((a, b) =>
    new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  )[0];
}

// Helper function to update session status
async function updateQuestioningSessionStatus(sessionId: string, status: string) {
  const updateCommand = new UpdateCommand({
    TableName: QUESTIONING_SESSIONS_TABLE,
    Key: { questioningSessionId: sessionId },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString()
    }
  });

  await docClient.send(updateCommand);
  console.log(`✅ Session ${sessionId} status updated to ${status}`);
}

// Helper function for API calls with timeout and retry
async function makeAPICallWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  timeoutMs: number = 30000
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If response is ok or non-retryable error, return it
      if (response.ok || response.status < 500) {
        return response;
      }

      // Server error - might be retryable
      if (attempt === maxRetries) {
        throw new ExtractPromptAPIError(
          `API call failed after ${maxRetries} attempts`,
          response.status
        );
      }

      console.log(`⚠️ API call failed (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff

    } catch (error) {
      if (error instanceof ExtractPromptAPIError) {
        throw error;
      }

      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ExtractPromptAPIError(`API call timed out after ${timeoutMs}ms`, 408, error);
        }
        throw new ExtractPromptAPIError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 503, error);
      }

      console.log(`⚠️ Network error (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new ExtractPromptAPIError('Unexpected error in retry logic', 500);
}



// Helper function to save chat message with error handling
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', apiResponse?: unknown, messageType?: 'default' | 'question-session' | 'loading-trends' | 'loading-competitors' | 'loading-final-idea' | 'loading-accounts' | 'trend-preview' | 'accounts-preview' | 'idea-preview', trendData?: unknown, accountsData?: unknown, ideaData?: unknown) {
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
    ...(apiResponse && { apiResponse }),
    ...(trendData && { trendData }),
    ...(accountsData && { accountsData }),
    ...(ideaData && { ideaData })
  };

  try {
    const putCommand = new PutCommand({
      TableName: CHAT_MESSAGES_TABLE,
      Item: messageData,
    });

    await docClient.send(putCommand);
    console.log(`✅ ${sender} message stored in DynamoDB:`, messageId);
    return messageId;
  } catch (error) {
    console.error(`❌ Failed to save ${sender} message:`, error);
    throw new DatabaseOperationError(
      `Failed to save ${sender} message to database`,
      'save_chat_message',
      error
    );
  }
}


// Helper function to get campaign details to extract projectId
async function getCampaignDetails(campaignId: string, userId: string) {
  const scanCommand = new ScanCommand({
    TableName: CAMPAIGNS_TABLE,
    FilterExpression: 'campaignId = :campaignId AND userId = :userId',
    ExpressionAttributeValues: {
      ':campaignId': campaignId,
      ':userId': userId
    }
  });

  const result = await docClient.send(scanCommand);
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

// Helper function to update project data with rollback capability
async function updateProjectData(projectId: string, userId: string, extractedData: Record<string, unknown>) {
  const projectFields = ['brand_name', 'offering', 'usp', 'icp', 'brand_voice', 'competitors', 'additional_information'];

  const updateExpressions = [];
  const expressionAttributeValues: Record<string, unknown> = {};

  projectFields.forEach(field => {
    if (extractedData[field] && typeof extractedData[field] === 'string' && (extractedData[field] as string).trim()) {
      updateExpressions.push(`${field} = :${field}`);
      expressionAttributeValues[`:${field}`] = extractedData[field];
    }
  });

  if (updateExpressions.length > 0) {
    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    try {
      const updateCommand = new UpdateCommand({
        TableName: PROJECTS_TABLE,
        Key: { projectId, userId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      await docClient.send(updateCommand);
      console.log('✅ Project updated with extracted data');
    } catch (error) {
      console.error('❌ Failed to update project data:', error);
      throw new DatabaseOperationError(
        'Failed to update project with extracted data',
        'update_project_data',
        error
      );
    }
  }
}

// Helper function to update campaign data with rollback capability
async function updateCampaignData(campaignId: string, userId: string, extractedData: Record<string, unknown>) {
  const campaignFields = ['goal', 'platform'];

  const updateExpressions = [];
  const expressionAttributeValues: Record<string, unknown> = {};

  campaignFields.forEach(field => {
    if (extractedData[field] && typeof extractedData[field] === 'string' && (extractedData[field] as string).trim()) {
      updateExpressions.push(`${field} = :${field}`);
      expressionAttributeValues[`:${field}`] = extractedData[field];
    }
  });

  if (updateExpressions.length > 0) {
    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    try {
      const updateCommand = new UpdateCommand({
        TableName: CAMPAIGNS_TABLE,
        Key: { userId, campaignId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      await docClient.send(updateCommand);
      console.log('✅ Campaign updated with extracted data');
    } catch (error) {
      console.error('❌ Failed to update campaign data:', error);
      throw new DatabaseOperationError(
        'Failed to update campaign with extracted data',
        'update_campaign_data',
        error
      );
    }
  }
}

// Helper function to execute database operations with rollback tracking
async function executeWithRollbackTracking(
  operations: Array<() => Promise<unknown>>,
  rollbackOperations: Array<() => Promise<unknown>>,
  operationName: string
) {
  const completedOperations: number[] = [];

  try {
    for (let i = 0; i < operations.length; i++) {
      await operations[i]();
      completedOperations.push(i);
      console.log(`✅ Operation ${i + 1}/${operations.length} completed for ${operationName}`);
    }

    return { success: true, completedOperations };
  } catch (error) {
    console.error(`❌ Operation failed for ${operationName}, attempting rollback:`, error);

    // Execute rollback operations in reverse order for completed operations
    for (let i = completedOperations.length - 1; i >= 0; i--) {
      const opIndex = completedOperations[i];
      try {
        if (rollbackOperations[opIndex]) {
          await rollbackOperations[opIndex]();
          console.log(`🔄 Rollback operation ${opIndex + 1} completed`);
        }
      } catch (rollbackError) {
        console.error(`❌ Rollback operation ${opIndex + 1} failed:`, rollbackError);
        // Continue with other rollback operations even if one fails
      }
    }

    throw new DatabaseOperationError(
      `Database operation failed during ${operationName}`,
      operationName,
      error
    );
  }
}

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

    let { campaignId } = requestData;
    const { userMessage, skipUserMessageSave } = requestData;

    if (!userMessage) {
      console.log('❌ Missing user message');
      return NextResponse.json({
        error: 'User message is required',
        success: false
      }, { status: 400 });
    }

    // If no campaignId provided, create project and campaign automatically
    let projectId = null;
    if (!campaignId) {
      console.log('📝 No campaign ID provided, creating project and campaign automatically');

      try {
        // Create project
        console.log('🔄 Creating new project...');
        const projectData = {
          brand_name: 'New Project',
          offering: '',
          usp: '',
          icp: '',
          brand_voice: '',
          competitors: '',
          additional_information: `Created from prompt: ${userMessage.substring(0, 200)}...`
        };

        const project = {
          projectId: uuidv4(),
          userId: userId,
          brand_name: projectData.brand_name,
          offering: projectData.offering || '',
          usp: projectData.usp || '',
          icp: projectData.icp || '',
          brand_voice: projectData.brand_voice || '',
          competitors: projectData.competitors || '',
          additional_information: projectData.additional_information || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const putProjectCommand = new PutCommand({
          TableName: PROJECTS_TABLE,
          Item: project
        });

        await docClient.send(putProjectCommand);
        console.log('✅ Project created:', project.projectId);
        projectId = project.projectId;

        // Create campaign
        console.log('🔄 Creating new campaign...');
        const campaign = {
          campaignId: uuidv4(),
          userId: userId,
          projectId: projectId,
          name: 'New Campaign',
          description: `Auto-created campaign from: ${userMessage.substring(0, 100)}...`,
          goal: '',
          platform: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const putCampaignCommand = new PutCommand({
          TableName: CAMPAIGNS_TABLE,
          Item: campaign
        });

        await docClient.send(putCampaignCommand);
        console.log('✅ Campaign created:', campaign.campaignId);
        campaignId = campaign.campaignId;

      } catch (error) {
        console.error('❌ Error creating project/campaign:', error);
        return NextResponse.json({
          error: 'Failed to create project and campaign',
          success: false
        }, { status: 500 });
      }
    }

    // Save user message first (unless already saved)
    let userMessageId = null;
    if (!skipUserMessageSave) {
      userMessageId = await saveChatMessage(campaignId, userId, userMessage, 'user');
      console.log('💾 User message saved to database with ID:', userMessageId);
    } else {
      console.log('⏭️ Skipping user message save (already saved by caller)');
    }

    // Check for active questioning session
    const activeSession = await getActiveQuestioningSession(campaignId, userId);
    console.log('🔍 Active questioning session:', activeSession ? 'Found' : 'None');

    // Handle recovery commands
    if (!activeSession) {
      const recoverableSession = await getRecoverableSession(campaignId, userId);

      if (recoverableSession) {
        const userMessageLower = userMessage.toLowerCase().trim();

        // Check if user wants to continue previous session
        if (userMessageLower.includes('continue') || userMessageLower.includes('yes') || userMessageLower === 'y') {
          console.log('🔄 User chose to continue recoverable session');

          // Reactivate the session
          await updateQuestioningSessionStatus(recoverableSession.questioningSessionId, 'active');

          // Extend expiration
          const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          const updateCommand = new UpdateCommand({
            TableName: QUESTIONING_SESSIONS_TABLE,
            Key: { questioningSessionId: recoverableSession.questioningSessionId },
            UpdateExpression: 'SET expiresAt = :expiresAt, lastActivityAt = :lastActivityAt',
            ExpressionAttributeValues: {
              ':expiresAt': newExpiresAt,
              ':lastActivityAt': new Date().toISOString()
            }
          });
          await docClient.send(updateCommand);

          const nextQuestion = recoverableSession.questions[recoverableSession.currentQuestionIndex];
          const progress = `${recoverableSession.qaHistory.length + 1} of ${recoverableSession.questions.length}`;

          const continueMessage = `Great! Let's continue where we left off.\n\nQuestion ${progress}: ${nextQuestion}`;
          const botMessageId = await saveChatMessage(campaignId, userId, continueMessage, 'bot', undefined, 'question-session');

          return NextResponse.json({
            message: 'Session recovered and continued',
            userMessageId,
            botMessageId,
            botMessage: continueMessage,
            sessionRecovered: true,
            currentQuestionIndex: recoverableSession.currentQuestionIndex,
            totalQuestions: recoverableSession.questions.length,
            success: true
          }, { status: 200 });
        }

        // Check if user wants to start over
        if (userMessageLower.includes('start over') || userMessageLower.includes('new') || userMessageLower.includes('restart')) {
          console.log('🔄 User chose to start over, marking old session as abandoned');
          await updateQuestioningSessionStatus(recoverableSession.questioningSessionId, 'abandoned');
          // Continue with normal flow below
        } else {
          // First time seeing recoverable session - offer recovery
          console.log('🔄 Offering session recovery to user');

          const progress = `${recoverableSession.qaHistory.length} of ${recoverableSession.questions.length}`;
          const nextQuestion = recoverableSession.questions[recoverableSession.currentQuestionIndex];

          const recoveryMessage = `I found an incomplete conversation where you were answering questions (${progress} questions answered). ` +
            `Would you like to continue where we left off?\n\n` +
            `Next question: ${nextQuestion}\n\n` +
            `Reply "continue" to resume, or "start over" to begin fresh.`;

          const botMessageId = await saveChatMessage(campaignId, userId, recoveryMessage, 'bot', undefined, 'question-session');

          return NextResponse.json({
            message: 'Recoverable session found',
            userMessageId,
            botMessageId,
            botMessage: recoveryMessage,
            recovery: {
              sessionId: recoverableSession.questioningSessionId,
              progress: progress,
              nextQuestion: nextQuestion,
              qaHistory: recoverableSession.qaHistory
            },
            success: true
          }, { status: 200 });
        }
      }
    }

    if (activeSession) {
      // We're in the middle of a questioning session - process the answer
      console.log('📝 Processing answer for questioning session:', activeSession.questioningSessionId);

      const currentQuestion = activeSession.questions[activeSession.currentQuestionIndex];
      if (!currentQuestion) {
        throw new Error('No current question found in active session');
      }

      // Update session with the answer using direct function call
      console.log('🔍 Debug - activeSession:', JSON.stringify(activeSession, null, 2));
      console.log('🔍 Debug - sessionId to use:', activeSession.questioningSessionId);

      const updateResult = await updateQuestioningSessionWithAnswer(
        activeSession.questioningSessionId,
        userId,
        userMessage,
        activeSession.campaignId
      );

      console.log('✅ Session updated, isComplete:', updateResult.isComplete);

      if (updateResult.isComplete) {
        // All questions answered - make final extract-prompt call
        console.log('🎯 All questions completed, making final extract-prompt call');

        const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
        if (!sreveApiEndpoint) {
          throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
        }

        // Get campaign and project details for final extract-prompt call
        const campaignDetails = await getCampaignDetails(campaignId, userId);
        let projectDetails = null;

        if (campaignDetails?.projectId) {
          try {
            const getCommand = new ScanCommand({
              TableName: PROJECTS_TABLE,
              FilterExpression: 'projectId = :projectId AND userId = :userId',
              ExpressionAttributeValues: {
                ':projectId': campaignDetails.projectId,
                ':userId': userId
              }
            });
            const result = await docClient.send(getCommand);
            projectDetails = result.Items && result.Items.length > 0 ? result.Items[0] : null;
            console.log('📋 Project details found for final extract-prompt:', !!projectDetails);
          } catch (error) {
            console.warn('⚠️ Could not fetch project details for final extract-prompt:', error);
          }
        }

        // Prepare final request with Q&A pairs and project/campaign context
        const qaContext = updateResult.session.qaHistory
          .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
          .join('\n\n');

        let finalMessage = `${activeSession.originalPrompt}\n\nAdditional Context:\n${qaContext}`;

        // Add project and campaign context to final message
        if (projectDetails || campaignDetails) {
          const contextParts = [];

          if (projectDetails) {
            const projectContext = [];
            if (projectDetails.brand_name) projectContext.push(`Brand: ${projectDetails.brand_name}`);
            if (projectDetails.offering) projectContext.push(`Offering: ${projectDetails.offering}`);
            if (projectDetails.usp) projectContext.push(`USP: ${projectDetails.usp}`);
            if (projectDetails.icp) projectContext.push(`Target Audience: ${projectDetails.icp}`);
            if (projectDetails.brand_voice) projectContext.push(`Brand Voice: ${projectDetails.brand_voice}`);
            if (projectDetails.competitors) projectContext.push(`Competitors: ${projectDetails.competitors}`);
            if (projectDetails.additional_information) projectContext.push(`Additional Info: ${projectDetails.additional_information}`);

            if (projectContext.length > 0) {
              contextParts.push(`Project Details:\n${projectContext.join('\n')}`);
            }
          }

          if (campaignDetails) {
            const campaignContext = [];
            if (campaignDetails.name) campaignContext.push(`Campaign: ${campaignDetails.name}`);
            if (campaignDetails.description) campaignContext.push(`Description: ${campaignDetails.description}`);
            if (campaignDetails.goal) campaignContext.push(`Goal: ${campaignDetails.goal}`);
            if (campaignDetails.platform) campaignContext.push(`Platform: ${campaignDetails.platform}`);

            if (campaignContext.length > 0) {
              contextParts.push(`Campaign Details:\n${campaignContext.join('\n')}`);
            }
          }

          if (contextParts.length > 0) {
            finalMessage = `${finalMessage}\n\n${contextParts.join('\n\n')}`;
            console.log('📝 Enhanced final message with project/campaign context');
          }
        }

        const finalRequest = {
          message: finalMessage
        };

        console.log('🔗 Calling final extract-prompt with Q&A pairs');
        const finalApiResponse = await extractPromptCircuitBreaker.execute(() =>
          makeAPICallWithRetry(
            `${sreveApiEndpoint}/extract-prompt`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(finalRequest),
            }
          )
        );

        if (!finalApiResponse.ok) {
          throw new ExtractPromptAPIError(
            `Final extract-prompt API call failed`,
            finalApiResponse.status
          );
        }

        const finalApiResult = await finalApiResponse.json();
        console.log('📥 Final SREVE API Response received');

        // Use campaign details already fetched above
        if (!campaignDetails) {
          throw new Error('Campaign not found');
        }

        // Update project and campaign with extracted data using rollback tracking
        await executeWithRollbackTracking(
          [
            () => updateProjectData(campaignDetails.projectId, userId, finalApiResult),
            () => updateCampaignData(campaignId, userId, finalApiResult)
          ],
          [
            // Note: DynamoDB doesn't support easy rollback, so we log the need for manual intervention
            () => Promise.resolve(console.log(`⚠️ Manual intervention may be needed for project ${campaignDetails.projectId}`)),
            () => Promise.resolve(console.log(`⚠️ Manual intervention may be needed for campaign ${campaignId}`))
          ],
          'final_data_update'
        );

        // Step 1: Show initial completion message and start sequential flow
        const completionMessage = 'Perfect! I\'ve processed all your information and updated your campaign. Now let me analyze current market trends for your brand...';
        const completionBotMessageId = await saveChatMessage(campaignId, userId, completionMessage, 'bot', undefined, 'default');

        // Structure the brand_details payload for all API calls
        const brandDetails = {
          brand_name: finalApiResult.brand_name || projectDetails?.brand_name || 'Unknown Brand',
          offering: finalApiResult.offering || projectDetails?.offering || '',
          usp: finalApiResult.usp || projectDetails?.usp || '',
          icp: finalApiResult.icp || projectDetails?.icp || '',
          goal: finalApiResult.goal || campaignDetails?.goal || '',
          platform: finalApiResult.platform || campaignDetails?.platform || '',
          brand_voice: finalApiResult.brand_voice || projectDetails?.brand_voice || '',
          competitors: finalApiResult.competitors || projectDetails?.competitors || ''
        };

        console.log('📋 Structured brand_details payload:', brandDetails);

        return NextResponse.json({
          message: 'Questions completed and campaign updated',
          userMessageId,
          botMessageId: completionBotMessageId,
          botMessage: completionMessage,
          extractedData: finalApiResult,
          brandDetails: brandDetails,
          questionsCompleted: true,
          nextStep: 'trends',
          ...(projectId && { createdProjectId: projectId }),
          ...(campaignId && { createdCampaignId: campaignId }),
          success: true
        }, { status: 201 });

      } else {
        // More questions remain - send next question
        const nextQuestion = updateResult.nextQuestion;
        const currentIndex = updateResult.session.currentQuestionIndex;
        const totalQuestions = activeSession.questions.length;

        const botMessage = `Thanks! Question ${currentIndex + 1} of ${totalQuestions}: ${nextQuestion}`;
        const botMessageId = await saveChatMessage(campaignId, userId, botMessage, 'bot', undefined, 'question-session');

        return NextResponse.json({
          message: 'Answer recorded, next question sent',
          userMessageId,
          botMessageId,
          botMessage,
          nextQuestion,
          currentQuestionIndex: currentIndex,
          totalQuestions,
          ...(projectId && { createdProjectId: projectId }),
          ...(campaignId && { createdCampaignId: campaignId }),
          success: true
        }, { status: 201 });
      }

    } else {
      // No active session - make initial extract-prompt call
      console.log('🚀 No active session, making initial extract-prompt call');

      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      // Get campaign and project details to include in the request
      const campaignDetails = await getCampaignDetails(campaignId, userId);
      let projectDetails = null;

      if (campaignDetails?.projectId) {
        try {
          const getCommand = new ScanCommand({
            TableName: PROJECTS_TABLE,
            FilterExpression: 'projectId = :projectId AND userId = :userId',
            ExpressionAttributeValues: {
              ':projectId': campaignDetails.projectId,
              ':userId': userId
            }
          });
          const result = await docClient.send(getCommand);
          projectDetails = result.Items && result.Items.length > 0 ? result.Items[0] : null;
          console.log('📋 Project details found for extract-prompt:', !!projectDetails);
        } catch (error) {
          console.warn('⚠️ Could not fetch project details for extract-prompt:', error);
        }
      }

      // Build the enhanced message with project and campaign context
      let enhancedMessage = userMessage;

      if (projectDetails || campaignDetails) {
        const contextParts = [];

        if (projectDetails) {
          const projectContext = [];
          if (projectDetails.brand_name) projectContext.push(`Brand: ${projectDetails.brand_name}`);
          if (projectDetails.offering) projectContext.push(`Offering: ${projectDetails.offering}`);
          if (projectDetails.usp) projectContext.push(`USP: ${projectDetails.usp}`);
          if (projectDetails.icp) projectContext.push(`Target Audience: ${projectDetails.icp}`);
          if (projectDetails.brand_voice) projectContext.push(`Brand Voice: ${projectDetails.brand_voice}`);
          if (projectDetails.competitors) projectContext.push(`Competitors: ${projectDetails.competitors}`);
          if (projectDetails.additional_information) projectContext.push(`Additional Info: ${projectDetails.additional_information}`);

          if (projectContext.length > 0) {
            contextParts.push(`Project Details:\n${projectContext.join('\n')}`);
          }
        }

        if (campaignDetails) {
          const campaignContext = [];
          if (campaignDetails.name) campaignContext.push(`Campaign: ${campaignDetails.name}`);
          if (campaignDetails.description) campaignContext.push(`Description: ${campaignDetails.description}`);
          if (campaignDetails.goal) campaignContext.push(`Goal: ${campaignDetails.goal}`);
          if (campaignDetails.platform) campaignContext.push(`Platform: ${campaignDetails.platform}`);

          if (campaignContext.length > 0) {
            contextParts.push(`Campaign Details:\n${campaignContext.join('\n')}`);
          }
        }

        if (contextParts.length > 0) {
          enhancedMessage = `${userMessage}\n\nContext:\n${contextParts.join('\n\n')}`;
          console.log('📝 Enhanced message with project/campaign context');
        }
      }

      const apiResponse = await extractPromptCircuitBreaker.execute(() =>
        makeAPICallWithRetry(
          `${sreveApiEndpoint}/extract-prompt`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: enhancedMessage
            }),
          }
        )
      );

      if (!apiResponse.ok) {
        throw new ExtractPromptAPIError(
          `Initial extract-prompt API call failed`,
          apiResponse.status
        );
      }

      const apiResult = await apiResponse.json();
      console.log('📥 Initial SREVE API Response received');

      if (apiResult.clarifying_questions && Array.isArray(apiResult.clarifying_questions) && apiResult.clarifying_questions.length > 0) {
        // We have clarifying questions - create questioning session
        console.log('❓ Clarifying questions found, creating questioning session');

        // Use direct function call instead of HTTP request
        const sessionResult = await createQuestioningSession(
          campaignId,
          userId,
          userMessage,
          apiResult.clarifying_questions
        );

        // Send first question
        const firstQuestion = apiResult.clarifying_questions[0];
        const totalQuestions = apiResult.clarifying_questions.length;
        const botMessage = `I need to clarify a few things to create the best campaign for you. Question 1 of ${totalQuestions}: ${firstQuestion}`;
        const botMessageId = await saveChatMessage(campaignId, userId, botMessage, 'bot', undefined, 'question-session');

        return NextResponse.json({
          message: 'Clarifying questions started',
          userMessageId,
          botMessageId,
          botMessage,
          questioningSessionId: sessionResult.session.questioningSessionId,
          firstQuestion,
          totalQuestions,
          ...(projectId && { createdProjectId: projectId }),
          ...(campaignId && { createdCampaignId: campaignId }),
          success: true
        }, { status: 201 });

      } else {
        // No questions - direct processing
        console.log('✅ No clarifying questions, processing directly');

        // Use campaign details already fetched above
        if (!campaignDetails) {
          throw new Error('Campaign not found');
        }

        // Update project and campaign with extracted data using rollback tracking
        await executeWithRollbackTracking(
          [
            () => updateProjectData(campaignDetails.projectId, userId, apiResult),
            () => updateCampaignData(campaignId, userId, apiResult)
          ],
          [
            // Note: DynamoDB doesn't support easy rollback, so we log the need for manual intervention
            () => Promise.resolve(console.log(`⚠️ Manual intervention may be needed for project ${campaignDetails.projectId}`)),
            () => Promise.resolve(console.log(`⚠️ Manual intervention may be needed for campaign ${campaignId}`))
          ],
          'direct_data_update'
        );

        // Step 1: Show initial completion message and start sequential flow
        const completionMessage = 'Great! I\'ve processed your request and updated your campaign. Now let me analyze current market trends for your brand...';
        const completionBotMessageId = await saveChatMessage(campaignId, userId, completionMessage, 'bot', undefined, 'default');

        // Structure the brand_details payload for all API calls
        const brandDetails = {
          brand_name: apiResult.brand_name || projectDetails?.brand_name || 'Unknown Brand',
          offering: apiResult.offering || projectDetails?.offering || '',
          usp: apiResult.usp || projectDetails?.usp || '',
          icp: apiResult.icp || projectDetails?.icp || '',
          goal: apiResult.goal || campaignDetails?.goal || '',
          platform: apiResult.platform || campaignDetails?.platform || '',
          brand_voice: apiResult.brand_voice || projectDetails?.brand_voice || '',
          competitors: apiResult.competitors || projectDetails?.competitors || ''
        };

        console.log('📋 Structured brand_details payload (direct flow):', brandDetails);

        return NextResponse.json({
          message: 'Chat processed successfully',
          userMessageId,
          botMessageId: completionBotMessageId,
          botMessage: completionMessage,
          extractedData: apiResult,
          brandDetails: brandDetails,
          nextStep: 'trends',
          ...(projectId && { createdProjectId: projectId }),
          ...(campaignId && { createdCampaignId: campaignId }),
          success: true
        }, { status: 201 });
      }
    }

  } catch (error: unknown) {
    const isDevelopment = process.env.ENVIRONMENT === 'Dev';

    // Enhanced error logging for development
    if (isDevelopment) {
      console.error('❌ DEVELOPMENT ERROR DETAILS:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : undefined,
        errorType: typeof error,
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT
      });
    } else {
      console.error('❌ Error in POST /api/chat:', error);
    }

    // Handle specific error types with appropriate responses
    if (error instanceof QuestioningSessionError) {
      const response = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          type: 'questioning_session_error',
          ...(isDevelopment && {
            developerInfo: {
              stack: error.stack,
              originalError: error.cause,
              timestamp: new Date().toISOString()
            }
          })
        }
      };
      return NextResponse.json(response, { status: error.statusCode });
    }

    if (error instanceof ExtractPromptAPIError) {
      const isRetryable = error.statusCode >= 500 || error.statusCode === 408;
      const circuitBreakerState = extractPromptCircuitBreaker.getState();

      const response = {
        success: false,
        error: {
          code: 'EXTRACT_PROMPT_API_ERROR',
          message: circuitBreakerState === 'OPEN'
            ? 'The AI service is temporarily unavailable due to repeated failures. Please try again in a moment.'
            : 'The AI service is temporarily unavailable. Please try again.',
          type: 'api_error',
          retryable: isRetryable && circuitBreakerState !== 'OPEN',
          retryAfter: circuitBreakerState === 'OPEN' ? 60 : (isRetryable ? 30 : undefined),
          circuitBreakerState,
          ...(isDevelopment && {
            developerInfo: {
              stack: error.stack,
              originalError: error.originalError,
              statusCode: error.statusCode,
              timestamp: new Date().toISOString()
            }
          })
        },
        context: {
          userMessageSaved: true,
          step: 'extract-prompt-call'
        }
      };
      return NextResponse.json(response, { status: error.statusCode === 408 ? 408 : 503 });
    }

    if (error instanceof DatabaseOperationError) {
      const response = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed. Please try again.',
          type: 'database_error',
          operation: error.operation,
          ...(isDevelopment && {
            developerInfo: {
              stack: error.stack,
              originalError: error.originalError,
              operation: error.operation,
              timestamp: new Date().toISOString()
            }
          })
        }
      };
      return NextResponse.json(response, { status: 500 });
    }

    if (error instanceof SessionRecoveryError) {
      const response = {
        success: false,
        error: {
          code: 'SESSION_RECOVERY_ERROR',
          message: error.message,
          type: 'session_error',
          sessionId: error.sessionId,
          ...(isDevelopment && {
            developerInfo: {
              stack: error.stack,
              sessionId: error.sessionId,
              timestamp: new Date().toISOString()
            }
          })
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Generic error fallback with development details
    const response = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isDevelopment
          ? `Development Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
          : 'An unexpected error occurred. Please try again.',
        type: 'internal_error',
        ...(isDevelopment && {
          developerInfo: {
            fullError: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause
            } : error,
            errorType: typeof error,
            errorConstructor: error instanceof Error ? error.constructor.name : undefined,
            timestamp: new Date().toISOString(),
            environment: process.env.ENVIRONMENT,
            nodeVersion: process.version
          }
        })
      }
    };
    return NextResponse.json(response, { status: 500 });
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
        TableName: CHAT_MESSAGES_TABLE,
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
    const isDevelopment = process.env.ENVIRONMENT === 'Dev';

    // Enhanced error logging for development
    if (isDevelopment) {
      console.error('❌ DEVELOPMENT ERROR DETAILS (GET):', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : undefined,
        errorType: typeof error,
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT
      });
    } else {
      console.error('❌ Error in GET /api/chat:', error);
    }

    const response = {
      error: isDevelopment
        ? `Development Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        : 'Internal server error',
      ...(isDevelopment && {
        developerInfo: {
          fullError: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
          } : error,
          errorType: typeof error,
          errorConstructor: error instanceof Error ? error.constructor.name : undefined,
          timestamp: new Date().toISOString(),
          environment: process.env.ENVIRONMENT,
          nodeVersion: process.version
        }
      })
    };
    return NextResponse.json(response, { status: 500 });
  }
}