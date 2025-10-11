# Generate Idea WebSocket Implementation Guide

## Overview

The WebSocket-based idea generation endpoint provides real-time, streaming content generation without the 29-second API Gateway timeout limitation. This guide explains how to integrate the WebSocket API into your client application.

---

## Why WebSocket Instead of HTTP?

| Feature | HTTP `/generate_idea` | WebSocket `generateIdea` |
|---------|----------------------|--------------------------|
| **Timeout** | 29 seconds (API Gateway limit) | 60+ seconds (no limit) |
| **Progress Updates** | ❌ No | ✅ Real-time streaming |
| **User Experience** | Loading spinner | Live progress indicators |
| **Response Time** | 15-25 seconds | Same, but with updates |
| **Error Handling** | Single response | Progressive fallback |

---

## WebSocket Endpoint

```
Refer SREVE_CREATOR_WEBSOCKET_URL in env file
```

**Route:** `generateIdea`

---

## Connection Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Connect to WebSocket
       ├──────────────────────────────►  WebSocket Server
       │
       │ 2. Send generateIdea request
       ├──────────────────────────────►
       │
       │ 3. Receive "connected" message
       ◄──────────────────────────────┤
       │
       │ 4. Receive "progress" (Stage 1: ideas)
       ◄──────────────────────────────┤
       │
       │ 5. Receive "ideas_ready" (5 ideas)
       ◄──────────────────────────────┤
       │
       │ 6. Receive "progress" (Stage 2: expansion)
       ◄──────────────────────────────┤
       │
       │ 7. Receive "complete" (full result)
       ◄──────────────────────────────┤
       │
       │ 8. Close connection
       └──────────────────────────────►
```

---

## Step-by-Step Implementation

### Step 1: Establish WebSocket Connection

**JavaScript/TypeScript:**

```javascript
const ws = new WebSocket('wss://your-api-id.execute-api.ap-south-1.amazonaws.com/dev');

// Handle connection opened
ws.onopen = () => {
  console.log('✅ WebSocket connected');
  // Proceed to Step 2
};

// Handle connection errors
ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};

// Handle connection closed
ws.onclose = (event) => {
  console.log('🔌 WebSocket closed:', event.code, event.reason);
};
```

**React Example:**

```javascript
import { useEffect, useState } from 'react';

function useIdeaGenerationWebSocket(wsUrl) {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setStatus('connected');
      setWs(websocket);
    };

    websocket.onclose = () => {
      setStatus('disconnected');
      setWs(null);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [wsUrl]);

  return { ws, status };
}
```

**Python Example:**

```python
import websocket
import json

ws = websocket.create_connection(
    "wss://your-api-id.execute-api.ap-south-1.amazonaws.com/dev"
)
print("✅ Connected to WebSocket")
```

---

### Step 2: Send Generate Idea Request

**Request Format:**

```json
{
  "action": "generateIdea",
  "brand_details": {
    "brand_name": "Your Brand Name",
    "offering": "Your product/service",
    "platform": "Instagram Reel | TikTok | YouTube Short | Static Post | Carousel",
    "goal": "increase brand awareness | drive sales | educate audience",
    "icp": "Your ideal customer profile",
    "usp": "Your unique selling proposition",
    "brand_voice": "professional | casual | innovative | inspiring"
  },
  "selected_accounts": [
    {
      "handle": "@competitor_handle",
      "posts": [
        {
          "caption": "Post caption text",
          "description": "Post description"
        }
      ]
    }
  ],
  "selected_trends": [
    {
      "trend": "Trend name",
      "prompt": "Trend description",
      "category": "Technology | Lifestyle | Business",
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "prompt": "User's specific request (e.g., 'Create a viral reel about our new feature')"
}
```

**JavaScript/TypeScript:**

```javascript
const request = {
  action: "generateIdea",
  brand_details: {
    brand_name: "TechFlow",
    offering: "AI-powered productivity tools",
    platform: "Instagram Reel",
    goal: "increase brand awareness",
    icp: "tech-savvy professionals aged 25-40",
    usp: "10x faster workflow automation",
    brand_voice: "innovative and inspiring"
  },
  selected_accounts: [
    {
      handle: "@competitor1",
      posts: [
        {
          caption: "Transform your workflow today",
          description: "Quick productivity tips"
        }
      ]
    }
  ],
  selected_trends: [
    {
      trend: "AI productivity hacks",
      prompt: "Show before/after transformations",
      category: "Technology",
      examples: ["Demo videos", "Time-lapse edits"]
    }
  ],
  prompt: "Create a viral reel showing how our AI tool saves time"
};

// Send the request
ws.send(JSON.stringify(request));
console.log('📤 Request sent');
```

**Python Example:**

```python
request = {
    "action": "generateIdea",
    "brand_details": {
        "brand_name": "TechFlow",
        "offering": "AI-powered productivity tools",
        "platform": "Instagram Reel",
        # ... rest of the data
    },
    # ... rest of the request
}

ws.send(json.dumps(request))
print("📤 Request sent")
```

---

### Step 3: Handle Incoming Messages

**Message Types:**

| Type | When | Data |
|------|------|------|
| `connected` | Initial connection | Confirmation message |
| `progress` | Before each stage | Stage name and message |
| `ideas_ready` | After Stage 1 (~5-8s) | Array of 5 ideas |
| `complete` | After Stage 2 (~12-15s) | Full result with execution script |
| `error` | On failure | Error message and details |

---

#### Message Type: `connected`

**Received immediately after connection:**

```json
{
  "type": "connected",
  "message": "WebSocket connected, starting idea generation..."
}
```

**Handle it:**

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'connected') {
    console.log('✅', data.message);
    // Show "Connected" status to user
  }
};
```

---

#### Message Type: `progress`

**Received before Stage 1 and Stage 2:**

**Stage 1 (Generating Ideas):**
```json
{
  "type": "progress",
  "stage": "ideas",
  "message": "Generating 5 creative ideas..."
}
```

**Stage 2 (Expanding Selected Idea):**
```json
{
  "type": "progress",
  "stage": "expansion",
  "message": "Expanding selected idea with full execution script...",
  "selected_index": 0
}
```

**Handle it:**

```javascript
if (data.type === 'progress') {
  console.log(`⏳ ${data.stage}:`, data.message);

  // Update UI with progress indicator
  if (data.stage === 'ideas') {
    showProgressMessage('Generating creative ideas...');
  } else if (data.stage === 'expansion') {
    showProgressMessage('Creating detailed execution script...');
  }
}
```

---

#### Message Type: `ideas_ready`

**Received after Stage 1 completes (~5-8 seconds):**

```json
{
  "type": "ideas_ready",
  "ideas": [
    {
      "angle": "Brief creative approach",
      "hook": "Catchy 7-word opening",
      "description": "25-word explanation"
    },
    {
      "angle": "Another creative approach",
      "hook": "Another catchy opening",
      "description": "Another explanation"
    }
    // ... 3 more ideas (total 5)
  ],
  "count": 5,
  "message": "Generated 5 creative ideas"
}
```

**Handle it:**

```javascript
if (data.type === 'ideas_ready') {
  console.log(`✨ ${data.count} ideas generated!`);

  // Display all ideas to the user
  data.ideas.forEach((idea, index) => {
    console.log(`Idea ${index + 1}:`);
    console.log(`  Angle: ${idea.angle}`);
    console.log(`  Hook: ${idea.hook}`);
    console.log(`  Description: ${idea.description}`);
  });

  // Update UI to show ideas
  displayIdeas(data.ideas);

  // Show message that expansion is coming next
  showProgressMessage('Expanding the best idea...');
}
```

**React Example:**

```javascript
const [ideas, setIdeas] = useState([]);
const [stage, setStage] = useState('connecting');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'ideas_ready') {
    setIdeas(data.ideas);
    setStage('expanding');
  }
};

// In your component
return (
  <div>
    {ideas.map((idea, i) => (
      <div key={i} className="idea-card">
        <h3>Idea {i + 1}</h3>
        <p><strong>Angle:</strong> {idea.angle}</p>
        <p><strong>Hook:</strong> {idea.hook}</p>
        <p><strong>Description:</strong> {idea.description}</p>
      </div>
    ))}
  </div>
);
```

---

#### Message Type: `complete`

**Received after Stage 2 completes (~12-15 seconds total):**

```json
{
  "type": "complete",
  "selected_idea": {
    "angle": "The winning creative approach",
    "hook": "The catchy 7-word opening",
    "description": "The 25-word explanation",
    "execution_script": "THE ACTUAL CONTENT in MARKDOWN FORMAT...\n\n# Reel Script\n\n## Hook (0-3s)\n..."
  },
  "reasoning": "Generated 5 wildly creative ideas for TechFlow based on 1 competitor accounts and 1 trending topics.",
  "message": "Idea generation complete!"
}
```

**Handle it:**

```javascript
if (data.type === 'complete') {
  console.log('🎉 Generation complete!');

  const selectedIdea = data.selected_idea;

  console.log('Selected Idea:');
  console.log(`  Angle: ${selectedIdea.angle}`);
  console.log(`  Hook: ${selectedIdea.hook}`);
  console.log(`  Description: ${selectedIdea.description}`);
  console.log(`\nExecution Script:\n${selectedIdea.execution_script}`);

  console.log(`\nReasoning: ${data.reasoning}`);

  // Update UI with final result
  displayFinalResult(selectedIdea, data.reasoning);

  // Close WebSocket connection
  ws.close();
}
```

**React Example:**

```javascript
const [selectedIdea, setSelectedIdea] = useState(null);
const [reasoning, setReasoning] = useState('');
const [isComplete, setIsComplete] = useState(false);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'complete') {
    setSelectedIdea(data.selected_idea);
    setReasoning(data.reasoning);
    setIsComplete(true);

    // Close connection
    ws.close();
  }
};

// In your component
return (
  <div>
    {isComplete && selectedIdea && (
      <div className="final-result">
        <h2>🎉 Your Idea is Ready!</h2>

        <div className="selected-idea">
          <h3>{selectedIdea.angle}</h3>
          <p className="hook">{selectedIdea.hook}</p>
          <p className="description">{selectedIdea.description}</p>

          <div className="execution-script">
            <h4>Execution Script</h4>
            <pre>{selectedIdea.execution_script}</pre>
          </div>
        </div>

        <p className="reasoning">{reasoning}</p>
      </div>
    )}
  </div>
);
```

---

#### Message Type: `error`

**Received if an error occurs:**

```json
{
  "type": "error",
  "message": "Error message describing what went wrong",
  "error": "Error type or category"
}
```

**Handle it:**

```javascript
if (data.type === 'error') {
  console.error('❌ Error:', data.message);
  console.error('Details:', data.error);

  // Show error to user
  showErrorMessage(data.message);

  // Close connection
  ws.close();
}
```

---

### Step 4: Close WebSocket Connection

**When to close:**
- ✅ After receiving `complete` message
- ✅ After receiving `error` message
- ✅ When user navigates away
- ✅ On component unmount (React)

**JavaScript:**

```javascript
// Graceful close
ws.close(1000, 'Normal closure');

// Or just
ws.close();
```

**React Cleanup:**

```javascript
useEffect(() => {
  const ws = new WebSocket(wsUrl);

  // ... setup event handlers

  // Cleanup on unmount
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, []);
```

---

## Complete JavaScript Example

```javascript
class IdeaGenerator {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected');
      };
    });
  }

  generateIdea(brandDetails, accounts, trends, prompt) {
    const request = {
      action: "generateIdea",
      brand_details: brandDetails,
      selected_accounts: accounts,
      selected_trends: trends,
      prompt: prompt
    };

    this.ws.send(JSON.stringify(request));
    console.log('📤 Request sent');
  }

  handleMessage(data) {
    switch (data.type) {
      case 'connected':
        console.log('✅', data.message);
        this.onConnected?.(data);
        break;

      case 'progress':
        console.log('⏳', data.stage, ':', data.message);
        this.onProgress?.(data);
        break;

      case 'ideas_ready':
        console.log('✨', data.count, 'ideas ready!');
        this.onIdeasReady?.(data.ideas);
        break;

      case 'complete':
        console.log('🎉 Complete!');
        this.onComplete?.(data.selected_idea, data.reasoning);
        this.disconnect();
        break;

      case 'error':
        console.error('❌', data.message);
        this.onError?.(data.message, data.error);
        this.disconnect();
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
}

// Usage
const generator = new IdeaGenerator('wss://your-api.amazonaws.com/dev');

// Set up callbacks
generator.onConnected = (data) => {
  console.log('Connection established!');
};

generator.onProgress = (data) => {
  updateProgressUI(data.stage, data.message);
};

generator.onIdeasReady = (ideas) => {
  displayIdeas(ideas);
};

generator.onComplete = (selectedIdea, reasoning) => {
  displayFinalResult(selectedIdea, reasoning);
};

generator.onError = (message, error) => {
  showError(message);
};

// Connect and generate
async function run() {
  await generator.connect();

  generator.generateIdea(
    {
      brand_name: "TechFlow",
      offering: "AI tools",
      platform: "Instagram Reel",
      // ... rest of brand details
    },
    [], // accounts
    [], // trends
    "Create a viral reel"
  );
}

run();
```

---

## Complete React Hook Example

```javascript
import { useEffect, useState, useCallback } from 'react';

function useIdeaGeneration(wsUrl) {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setStatus('connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          setStatus('connected');
          break;

        case 'progress':
          setCurrentStage(data.stage);
          break;

        case 'ideas_ready':
          setIdeas(data.ideas);
          setCurrentStage('expansion');
          break;

        case 'complete':
          setSelectedIdea(data.selected_idea);
          setReasoning(data.reasoning);
          setStatus('complete');
          websocket.close();
          break;

        case 'error':
          setError(data.message);
          setStatus('error');
          websocket.close();
          break;
      }
    };

    websocket.onerror = () => {
      setStatus('error');
      setError('WebSocket connection error');
    };

    websocket.onclose = () => {
      setStatus('disconnected');
      setWs(null);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [wsUrl]);

  const generateIdea = useCallback((brandDetails, accounts, trends, prompt) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    const request = {
      action: "generateIdea",
      brand_details: brandDetails,
      selected_accounts: accounts,
      selected_trends: trends,
      prompt: prompt
    };

    ws.send(JSON.stringify(request));
    setCurrentStage('ideas');
  }, [ws]);

  return {
    status,
    ideas,
    selectedIdea,
    reasoning,
    error,
    currentStage,
    generateIdea
  };
}

// Component usage
function IdeaGeneratorComponent() {
  const {
    status,
    ideas,
    selectedIdea,
    reasoning,
    error,
    currentStage,
    generateIdea
  } = useIdeaGeneration('wss://your-api.amazonaws.com/dev');

  const handleGenerate = () => {
    generateIdea(
      {
        brand_name: "TechFlow",
        offering: "AI tools",
        platform: "Instagram Reel",
        // ... rest of brand details
      },
      [], // accounts
      [], // trends
      "Create a viral reel"
    );
  };

  return (
    <div>
      <h1>Idea Generator</h1>

      <div>Status: {status}</div>
      <div>Stage: {currentStage}</div>

      <button onClick={handleGenerate} disabled={status !== 'connected'}>
        Generate Idea
      </button>

      {error && <div className="error">{error}</div>}

      {ideas.length > 0 && (
        <div className="ideas">
          <h2>Generated Ideas</h2>
          {ideas.map((idea, i) => (
            <div key={i}>
              <h3>Idea {i + 1}</h3>
              <p>{idea.angle}</p>
              <p>{idea.hook}</p>
            </div>
          ))}
        </div>
      )}

      {selectedIdea && (
        <div className="final-result">
          <h2>Selected Idea</h2>
          <h3>{selectedIdea.angle}</h3>
          <p>{selectedIdea.hook}</p>
          <pre>{selectedIdea.execution_script}</pre>
          <p>{reasoning}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling Best Practices

### 1. Connection Errors

```javascript
ws.onerror = (error) => {
  console.error('Connection failed:', error);
  // Show user-friendly message
  showError('Unable to connect to the server. Please check your internet connection.');
};
```

### 2. Timeout Handling

```javascript
const timeout = setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
    showError('Request timed out. Please try again.');
  }
}, 60000); // 60 seconds

ws.onmessage = (event) => {
  clearTimeout(timeout); // Clear timeout on any message
  // Handle message...
};
```

### 3. Reconnection Logic

```javascript
function connectWithRetry(maxRetries = 3) {
  let retries = 0;

  function connect() {
    const ws = new WebSocket(wsUrl);

    ws.onerror = () => {
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying connection (${retries}/${maxRetries})...`);
        setTimeout(connect, 2000 * retries); // Exponential backoff
      } else {
        showError('Failed to connect after multiple attempts');
      }
    };

    // ... rest of setup
  }

  connect();
}
```

---

## Performance Optimization Tips

1. **Close connections when done:**
   ```javascript
   // Always close after receiving complete/error
   ws.close();
   ```

2. **Handle unmount in React:**
   ```javascript
   useEffect(() => {
     return () => ws?.close();
   }, [ws]);
   ```

3. **Throttle UI updates:**
   ```javascript
   // If receiving many messages, throttle updates
   const throttledUpdate = throttle((data) => {
     updateUI(data);
   }, 100);
   ```

4. **Preload WebSocket connection:**
   ```javascript
   // Connect early, send request later
   useEffect(() => {
     connectWebSocket();
   }, []);
   ```

---

## Testing

### Local Testing

1. **Deploy the serverless application:**
   ```bash
   serverless deploy
   ```

2. **Get your WebSocket URL from deployment output**

3. **Use the HTML test file:**
   ```bash
   open test_websocket_idea.html
   ```

4. **Or use the Python test script:**
   ```bash
   python test_websocket_idea.py
   ```

### Browser DevTools

```javascript
// Test in browser console
const ws = new WebSocket('wss://your-api.amazonaws.com/dev');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
ws.send(JSON.stringify({
  action: "generateIdea",
  // ... your request data
}));
```

---

## Troubleshooting

### Issue: "WebSocket connection failed"

**Solutions:**
- ✅ Check WebSocket URL format: `wss://` (not `https://`)
- ✅ Verify API is deployed: `serverless info`
- ✅ Check CORS settings if connecting from browser
- ✅ Verify AWS region matches your deployment

### Issue: "No response after sending request"

**Solutions:**
- ✅ Check `action` field is exactly `"generateIdea"`
- ✅ Verify `brand_details` is provided (required)
- ✅ Check CloudWatch logs for backend errors
- ✅ Ensure request JSON is valid

### Issue: "Connection closes immediately"

**Solutions:**
- ✅ Check Lambda timeout (should be 60s)
- ✅ Verify IAM permissions for Bedrock API
- ✅ Check rate limits aren't exceeded
- ✅ Review CloudWatch logs for errors

### Issue: "Timeout after 29 seconds"

**Solutions:**
- ✅ Ensure using WebSocket (not HTTP)
- ✅ Check `serverless.yml` timeout is 60s for WebSocket functions
- ✅ Verify correct route: `generateIdea` (not HTTP endpoint)

---

## Support

- **Documentation:** See `WEBSOCKET_API_DOCUMENTATION.md`
- **Test Files:** `test_websocket_idea.html`, `test_websocket_idea.py`
- **Logs:** Check AWS CloudWatch for backend errors
- **Example:** See working implementation in test files

---

## Summary

### Quick Steps:
1. ✅ Connect to WebSocket URL
2. ✅ Send request with `action: "generateIdea"`
3. ✅ Handle `connected` message
4. ✅ Handle `progress` messages (show to user)
5. ✅ Handle `ideas_ready` message (display 5 ideas)
6. ✅ Handle `complete` message (show final result)
7. ✅ Handle `error` messages
8. ✅ Close connection when done

### Timeline:
- **0s:** Connection established
- **0-5s:** Stage 1 - Generating ideas
- **5-8s:** Receive 5 ideas (`ideas_ready`)
- **8-12s:** Stage 2 - Expanding selected idea
- **12-15s:** Receive complete result (`complete`)

**Total time: ~12-15 seconds with real-time progress updates! 🚀**
