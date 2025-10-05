# Sequential Chat Flow Architecture - STRICT IMPLEMENTATION GUIDE

## ⚠️ CRITICAL NOTICE
**This document defines the MANDATORY architecture for the sequential chat flow. Any future changes to the chat system MUST strictly follow this pattern. DO NOT deviate from this implementation without explicit approval.**

## 🏗️ Current Architecture Overview

The sequential chat flow implements a simple, straightforward approach:
1. **Main chat API** returns `brandDetails` and `nextStep: 'trends'`
2. **Frontend sequential handler** calls three APIs in order
3. **Each API** shows loading → processes → returns result → cleans up
4. **No async operations**, no polling, no complex message updates

## 📋 Sequential Flow Pattern

### Step-by-Step Process
```
1. User submits chat → Main chat API processes → Returns brandDetails + nextStep
2. Frontend calls trends API → Shows loading → Returns result → Deletes loading from DB
3. Frontend calls accounts API → Shows loading → Returns result → Deletes loading from DB
4. Frontend calls ideas API → Shows loading → Returns result → Deletes loading from DB
5. Flow complete → User sees final results
```

## 🔧 Frontend Implementation (MANDATORY PATTERN)

### Location: `/app/app/page.tsx`

#### 1. Main Chat Response Handler
```typescript
// When main chat API returns brandDetails and nextStep
if (data.nextStep && data.brandDetails) {
  console.log('🚀 Starting sequential flow with step:', data.nextStep);
  await handleSequentialFlow(data.nextStep, data.brandDetails, selectedCampaignId);
}
```

#### 2. Sequential Flow Handler (REQUIRED STRUCTURE)
```typescript
const handleSequentialFlow = useCallback(async (step: string, brandDetails: Record<string, unknown>, campaignId: string) => {
  const flowStartTime = Date.now();
  console.log('🚀 [SEQUENTIAL-FLOW] Starting sequential flow:', { step, campaignId, brandName: brandDetails.brand_name });

  try {
    if (step === 'trends') {
      // STEP 1: TRENDS ANALYSIS
      // 1a. Show immediate loading message in frontend
      const trendsLoadingMessage: ChatMessage = {
        id: `trends-loading-${Date.now()}`,
        text: 'Analyzing current market trends for your brand...',
        sender: 'bot',
        messageType: 'loading-trends',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, trendsLoadingMessage]);

      // 1b. Call trends API
      const trendsResponse = await fetch('/api/chat/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, brandDetails })
      });

      // 1c. Replace loading message with result
      const trendsResult = await trendsResponse.json();
      if (trendsResult.success && trendsResult.trendData) {
        const trendMessage: ChatMessage = {
          id: trendsResult.trendBotMessageId,
          text: trendsResult.trendMessage,
          sender: 'bot',
          messageType: 'trend-preview',
          timestamp: new Date(),
          trendData: trendsResult.trendData.chosen_trend || trendsResult.trendData,
          trendApiResponse: trendsResult.trendData.chosen_trend ? trendsResult.trendData : undefined
        };

        setMessages(prev => {
          const loadingIndex = prev.findIndex(msg => msg.messageType === 'loading-trends' && msg.sender === 'bot');
          if (loadingIndex !== -1) {
            const updated = [...prev];
            updated[loadingIndex] = trendMessage;
            return updated;
          }
          return [...prev, trendMessage];
        });
      }

      // STEP 2: ACCOUNTS ANALYSIS (repeat same pattern)
      // STEP 3: IDEAS GENERATION (repeat same pattern)
    }
  } catch (error) {
    // Error handling with fallback message
  }
}, []);
```

#### 3. Loading Message Replacement (MANDATORY PATTERN)
```typescript
// ALWAYS use this pattern for replacing loading messages
setMessages(prev => {
  const loadingIndex = prev.findIndex(msg =>
    msg.messageType === 'loading-[STEP-NAME]' && msg.sender === 'bot'
  );
  if (loadingIndex !== -1) {
    const updated = [...prev];
    updated[loadingIndex] = resultMessage;
    return updated;
  }
  return [...prev, resultMessage];
});
```

## 🔧 Backend API Implementation (MANDATORY PATTERN)

### Required Structure for Each Sequential API

#### 1. File Structure
```
/app/api/chat/trends/route.ts
/app/api/chat/accounts/route.ts
/app/api/chat/ideas/route.ts
```

#### 2. Required Imports (MANDATORY)
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
```

#### 3. Required Helper Functions (MANDATORY)
```typescript
// Helper function to save chat message
async function saveChatMessage(campaignId: string, userId: string, message: string, sender: 'user' | 'bot', messageType?: string, data?: unknown) {
  // Implementation as defined in current code
}

// Helper function to delete a chat message (CRITICAL FOR CLEANUP)
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
```

#### 4. API Endpoint Structure (MANDATORY PATTERN)
```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [API-NAME] POST /api/chat/[endpoint] - Request received');

  try {
    // 1. Authentication check
    const { userId } = await auth();
    if (!userId) return unauthorized response;

    // 2. Parse and validate request
    const { campaignId, brandDetails } = await request.json();
    if (!campaignId || !brandDetails) return validation error;

    // 3. Create loading message in DynamoDB
    const loadingMessage = 'Loading message text...';
    const loadingBotMessageId = await saveChatMessage(campaignId, userId, loadingMessage, 'bot', 'loading-[type]');
    console.log('✅ [API-NAME] Loading message created with ID:', loadingBotMessageId);

    try {
      // 4. Make external API call
      const apiResponse = await makeAPICallWithRetry(apiEndpoint, payload);

      if (apiResponse.ok) {
        const responseData = await apiResponse.json();

        if (responseData.hasResults) {
          // 5a. Save result message
          const resultMessage = 'Result message text...';
          const resultBotMessageId = await saveChatMessage(campaignId, userId, resultMessage, 'bot', 'result-type', responseData);

          // 5b. CRITICAL: Delete loading message from DynamoDB
          console.log('🗑️ [API-NAME] Deleting loading message from DynamoDB');
          await deleteChatMessage(loadingBotMessageId);
          console.log('✅ [API-NAME] Loading message deleted from DynamoDB');

          // 5c. Return success response
          return NextResponse.json({
            success: true,
            loadingBotMessageId,
            resultBotMessageId,
            resultMessage,
            resultData: responseData,
            nextStep: 'next-step-name' // if applicable
          });
        } else {
          // Handle no results case - STILL DELETE LOADING MESSAGE
          const noResultMessage = 'No results message...';
          const noResultBotMessageId = await saveChatMessage(campaignId, userId, noResultMessage, 'bot', 'default');

          // CRITICAL: Always delete loading message
          await deleteChatMessage(loadingBotMessageId);

          return success response;
        }
      } else {
        throw new Error(`API call failed with status: ${apiResponse.status}`);
      }
    } catch (error) {
      // 6. Error handling - ALWAYS DELETE LOADING MESSAGE
      const errorMessage = 'Error message text...';
      const errorBotMessageId = await saveChatMessage(campaignId, userId, errorMessage, 'bot', 'default');

      // CRITICAL: Delete loading message even on error
      console.log('🗑️ [API-NAME] Deleting loading message from DynamoDB');
      await deleteChatMessage(loadingBotMessageId);
      console.log('✅ [API-NAME] Loading message deleted from DynamoDB');

      return error response;
    }
  } catch (error) {
    // Global error handler
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}
```

## 📝 Logging Standards (MANDATORY)

### Frontend Logging Pattern
```typescript
console.log('🚀 [SEQUENTIAL-FLOW] Starting step:', stepName);
console.log('📈 [SEQUENTIAL-FLOW] Step X/3: Description');
console.log('🔄 [SEQUENTIAL-FLOW] Replacing loading message with results');
console.log('➕ [SEQUENTIAL-FLOW] Adding new message');
console.log('✅ [SEQUENTIAL-FLOW] All steps completed successfully in Xms!');
console.error('❌ [SEQUENTIAL-FLOW] Error in sequential flow:', error);
```

### Backend Logging Pattern
```typescript
console.log('📥 [API-NAME] POST /api/chat/endpoint - Request received');
console.log('💬 [API-NAME] Creating loading message for campaign:', campaignId);
console.log('✅ [API-NAME] Loading message created with ID:', messageId);
console.log('🔍 [API-NAME] Making external API call');
console.log('⏱️ [API-NAME] API call completed in Xms');
console.log('💾 [API-NAME] Saving result message');
console.log('🗑️ [API-NAME] Deleting loading message from DynamoDB');
console.log('✅ [API-NAME] Loading message deleted from DynamoDB');
console.log('🎯 [API-NAME] Success response sent (Xms total)');
console.error('❌ [API-NAME] Error occurred:', errorDetails);
```

## 🚨 CRITICAL RULES (NEVER BREAK THESE)

### 1. Loading Message Lifecycle
- ✅ **ALWAYS** create loading message in DynamoDB when API starts
- ✅ **ALWAYS** show loading message in frontend immediately
- ✅ **ALWAYS** delete loading message from DynamoDB when result comes in
- ✅ **ALWAYS** replace frontend loading message with result
- ❌ **NEVER** leave loading messages in DynamoDB after completion
- ❌ **NEVER** show multiple loading messages for same step

### 2. Sequential Flow Rules
- ✅ **ALWAYS** call APIs in order: trends → accounts → ideas
- ✅ **ALWAYS** wait for each API to complete before starting next
- ✅ **ALWAYS** handle errors gracefully and continue flow
- ❌ **NEVER** make parallel/async API calls in sequential flow
- ❌ **NEVER** use polling or message updates
- ❌ **NEVER** break the linear progression

### 3. Message Management Rules
- ✅ **ALWAYS** use frontend-generated IDs for loading messages
- ✅ **ALWAYS** use DynamoDB IDs for result messages
- ✅ **ALWAYS** replace loading messages, don't add duplicates
- ❌ **NEVER** rely on DynamoDB IDs for frontend loading message replacement
- ❌ **NEVER** leave orphaned messages in the UI or database

### 4. Error Handling Rules
- ✅ **ALWAYS** delete loading messages even when APIs fail
- ✅ **ALWAYS** provide user-friendly error messages
- ✅ **ALWAYS** continue the flow even if individual steps fail
- ❌ **NEVER** leave loading messages when errors occur
- ❌ **NEVER** crash the entire flow due to single API failure

## 🔧 Response Format Standards

### Main Chat API Response (Required)
```typescript
return NextResponse.json({
  message: 'Questions completed and campaign updated',
  userMessageId,
  botMessageId: completionBotMessageId,
  botMessage: completionMessage,
  extractedData: finalApiResult,
  brandDetails: brandDetails,      // REQUIRED for sequential flow
  questionsCompleted: true,
  nextStep: 'trends',             // REQUIRED to trigger sequential flow
  success: true
}, { status: 201 });
```

### Sequential API Response Format (Required)
```typescript
// Success with data
return NextResponse.json({
  message: 'Step completed',
  loadingBotMessageId,           // For frontend tracking
  resultBotMessageId,            // New result message ID
  resultMessage,                 // Result message text
  resultData,                    // Actual data (trendData, accountsData, etc.)
  nextStep: 'next-step-name',    // If applicable
  success: true
}, { status: 200 });

// Success with no data
return NextResponse.json({
  message: 'Step completed (no data)',
  loadingBotMessageId,
  noResultBotMessageId,
  noResultMessage,
  nextStep: 'next-step-name',
  success: true
}, { status: 200 });

// Error (still successful flow continuation)
return NextResponse.json({
  message: 'Step failed, continuing',
  loadingBotMessageId,
  errorBotMessageId,
  errorMessage,
  nextStep: 'next-step-name',
  success: true                  // Still true to continue flow
}, { status: 200 });
```

## 📁 File Organization

### Required Files
```
/app/api/chat/route.ts              # Main chat API
/app/api/chat/trends/route.ts       # Step 1: Trends analysis
/app/api/chat/accounts/route.ts     # Step 2: Accounts analysis
/app/api/chat/ideas/route.ts        # Step 3: Ideas generation
/app/app/page.tsx                   # Frontend implementation
```

### Required Functions in Frontend
```
handleSequentialFlow()              # Main sequential orchestrator
handleSendMessage()                 # Triggers sequential flow
```

### Required Functions in Each Backend API
```
saveChatMessage()                   # Store messages in DynamoDB
deleteChatMessage()                 # Remove messages from DynamoDB
makeAPICallWithRetry()              # External API calls with retry
```

## 🧪 Testing Requirements

### Before Any Changes
1. ✅ Build must pass: `npm run build`
2. ✅ Loading messages appear immediately in frontend
3. ✅ Loading messages get replaced with results
4. ✅ Loading messages are deleted from DynamoDB
5. ✅ Page refresh shows only final results (no loading messages)
6. ✅ Error scenarios handle cleanup properly
7. ✅ Sequential flow completes all 3 steps in order

### Test Scenarios (MANDATORY)
1. **Happy Path**: All APIs succeed → All 3 results show
2. **Trends Fails**: Trends fails → Still proceeds to accounts and ideas
3. **Accounts Fails**: Accounts fails → Still proceeds to ideas
4. **Ideas Fails**: Ideas fails → Flow completes gracefully
5. **Page Refresh**: Refresh during flow → Only see final persistent results
6. **Error Recovery**: Network errors → Proper error messages, flow continues

## 💡 Implementation Notes

### Why This Architecture Works
- **Simple and predictable**: Linear flow, easy to debug
- **User-friendly**: Immediate feedback, clear progression
- **Robust**: Handles failures gracefully, continues flow
- **Clean state**: No orphaned loading messages
- **Maintainable**: Clear separation of concerns

### Performance Characteristics
- **Sequential execution**: ~3-10 seconds total for all steps
- **Immediate UI feedback**: Loading messages appear instantly
- **Clean database**: No accumulation of temporary messages
- **Efficient**: Each API called only once, no retries unless external API fails

## ⚠️ FINAL WARNING

**THIS ARCHITECTURE IS PROVEN AND WORKING PERFECTLY. ANY FUTURE MODIFICATIONS TO THE CHAT SYSTEM MUST:**

1. ✅ Follow the exact patterns defined in this document
2. ✅ Maintain the sequential flow structure
3. ✅ Implement proper loading message lifecycle management
4. ✅ Include comprehensive logging
5. ✅ Pass all testing requirements
6. ✅ Get explicit approval before deviating from this pattern

**FAILURE TO FOLLOW THIS ARCHITECTURE WILL RESULT IN:**
- ❌ Broken loading states
- ❌ Orphaned messages in database
- ❌ Poor user experience
- ❌ Debugging nightmares
- ❌ System instability

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Status**: MANDATORY - DO NOT MODIFY WITHOUT APPROVAL