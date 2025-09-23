import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Chat Accounts API endpoint loaded');

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
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string, accountsData?: unknown) {
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
    ...(accountsData && { accountsData })
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
    console.log(`✅ Message deleted from DynamoDB:`, messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete message:`, error);
    return false;
  }
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

      if (response.ok || response.status < 500) {
        return response;
      }

      if (attempt === maxRetries) {
        throw new Error(`API call failed after ${maxRetries} attempts`);
      }

      console.log(`⚠️ API call failed (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

    } catch (error) {
      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`API call timed out after ${timeoutMs}ms`);
        }
        throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log(`⚠️ Network error (attempt ${attempt}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Unexpected error in retry logic');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [ACCOUNTS-API] POST /api/chat/accounts - Accounts analysis request received');

  try {
    const { userId } = await auth();
    console.log('👤 [ACCOUNTS-API] Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ [ACCOUNTS-API] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 [ACCOUNTS-API] Request data received:', {
      campaignId: requestData.campaignId,
      brandDetailsKeys: Object.keys(requestData.brandDetails || {}),
      requestSize: JSON.stringify(requestData).length
    });

    const { campaignId, brandDetails } = requestData;

    if (!campaignId || !brandDetails) {
      console.log('❌ [ACCOUNTS-API] Missing required data:', {
        campaignId: !!campaignId,
        brandDetails: !!brandDetails,
        brandDetailsKeys: brandDetails ? Object.keys(brandDetails) : []
      });
      return NextResponse.json({
        error: 'Campaign ID and brand details are required',
        success: false
      }, { status: 400 });
    }

    // Show loading message
    console.log('💬 [ACCOUNTS-API] Creating loading message for campaign:', campaignId);
    const loadingMessage = 'Finding successful competitor accounts that align with your brand strategy...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-accounts');
    console.log('✅ [ACCOUNTS-API] Loading message created with ID:', loadingBotMessageId);

    try {
      // Make find-accounts API call
      const sreveApiEndpoint = process.env.SREVE_CREATOR_API_ENDPOINT;
      if (!sreveApiEndpoint) {
        console.log('❌ [ACCOUNTS-API] SREVE_CREATOR_API_ENDPOINT not configured');
        throw new Error('SREVE_CREATOR_API_ENDPOINT not configured');
      }

      console.log('🔍 [ACCOUNTS-API] Making find-accounts API call');
      console.log('📊 [ACCOUNTS-API] Brand details summary:', {
        brand_name: brandDetails.brand_name,
        offering: brandDetails.offering ? 'provided' : 'missing',
        platform: brandDetails.platform,
        competitors: brandDetails.competitors ? 'provided' : 'missing'
      });

      const apiCallStart = Date.now();
      const findAccountsResponse = await makeAPICallWithRetry(
        `${sreveApiEndpoint}/find-accounts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_details: brandDetails }),
        }
      );
      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`⏱️ [ACCOUNTS-API] API call completed in ${apiCallDuration}ms`);

      if (findAccountsResponse.ok) {
        const accountsData = await findAccountsResponse.json();
        console.log('🔍 [ACCOUNTS-API] Find-accounts API response received:', {
          hasSelectedAccounts: !!accountsData?.selected_accounts,
          accountsCount: accountsData?.selected_accounts?.length || 0,
          hasOverallReasoning: !!accountsData?.overall_reasoning,
          responseSize: JSON.stringify(accountsData).length
        });

        if (accountsData?.selected_accounts && accountsData.selected_accounts.length > 0) {
          const accountsMessage = `Great! I've found some successful competitor accounts that align with your brand strategy. Here are the top accounts to study:`;

          // Save accounts results and delete loading message
          console.log('💾 [ACCOUNTS-API] Saving accounts results message');
          const accountsBotMessageId = await saveChatMessage(campaignId, userId, accountsMessage, 'bot', 'accounts-preview', accountsData);
          console.log('✅ [ACCOUNTS-API] Accounts results message saved with ID:', accountsBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [ACCOUNTS-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [ACCOUNTS-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [ACCOUNTS-API] Success response sent (${totalDuration}ms total)`);

          return NextResponse.json({
            message: 'Accounts analysis completed',
            loadingBotMessageId,
            accountsBotMessageId,
            accountsMessage,
            accountsData,
            nextStep: 'ideas',
            success: true
          }, { status: 200 });
        } else {
          console.log('ℹ️ [ACCOUNTS-API] No accounts found in response');
          const noAccountsMessage = 'I\'ve analyzed competitor accounts. Moving on to generate creative ideas...';
          const noAccountsBotMessageId = await saveChatMessage(campaignId, userId, noAccountsMessage, 'bot', 'default');
          console.log('✅ [ACCOUNTS-API] No-accounts message saved with ID:', noAccountsBotMessageId);

          // Delete the loading message from DynamoDB
          console.log('🗑️ [ACCOUNTS-API] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [ACCOUNTS-API] Loading message deleted from DynamoDB');

          const totalDuration = Date.now() - startTime;
          console.log(`🎯 [ACCOUNTS-API] No-accounts response sent (${totalDuration}ms total)`);

          return NextResponse.json({
            message: 'Accounts analysis completed (no accounts found)',
            loadingBotMessageId,
            noAccountsBotMessageId,
            noAccountsMessage,
            nextStep: 'ideas',
            success: true
          }, { status: 200 });
        }
      } else {
        console.log(`❌ [ACCOUNTS-API] API call failed with status: ${findAccountsResponse.status}`);
        throw new Error(`Accounts API call failed with status: ${findAccountsResponse.status}`);
      }
    } catch (error) {
      console.error('❌ [ACCOUNTS-API] Find-accounts API call error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        apiEndpoint: process.env.SREVE_CREATOR_API_ENDPOINT ? 'configured' : 'missing'
      });

      const errorMessage = 'Unable to analyze competitor accounts at the moment. Moving to generate ideas...';
      console.log('💾 [ACCOUNTS-API] Saving error message');
      const errorBotMessageId = await saveChatMessage(campaignId, userId, errorMessage, 'bot', 'default');
      console.log('✅ [ACCOUNTS-API] Error message saved with ID:', errorBotMessageId);

      // Delete the loading message from DynamoDB
      console.log('🗑️ [ACCOUNTS-API] Deleting loading message from DynamoDB');
      await deleteChatMessage(loadingBotMessageId);
      console.log('✅ [ACCOUNTS-API] Loading message deleted from DynamoDB');

      const totalDuration = Date.now() - startTime;
      console.log(`🎯 [ACCOUNTS-API] Error response sent (${totalDuration}ms total)`);

      return NextResponse.json({
        message: 'Accounts analysis failed, continuing',
        loadingBotMessageId,
        errorBotMessageId,
        errorMessage,
        nextStep: 'ideas',
        success: true
      }, { status: 200 });
    }

  } catch (error: unknown) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ [ACCOUNTS-API] Unexpected error in accounts endpoint:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      duration: totalDuration
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'ACCOUNTS_ERROR',
        message: 'Failed to analyze accounts. Please try again.',
        type: 'api_error'
      }
    }, { status: 500 });
  }
}