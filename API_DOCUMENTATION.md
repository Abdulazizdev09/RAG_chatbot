# 📚 F1GPT RAG Chatbot - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication
No authentication required for development. All endpoints accept requests without API keys.

---

## 📋 Endpoints

### 1. Chat Endpoint
**Sends a message and receives streamed AI response**

#### Request
```
POST /api/chat
Content-Type: application/json
```

**Body:**
```typescript
{
  "messages": [
    {
      "id": string,           // Unique message ID
      "content": string,      // User message
      "role": "user"          // Always "user"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "id": "msg-1",
        "content": "Who won the 2024 F1 championship?",
        "role": "user"
      }
    ]
  }'
```

#### Response
```
Status: 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked
```

**Streaming Response (text chunks):**
```
Max Verstappen won the 2024 F1 championship...
```

**Error Response (400):**
```json
{
  "error": "No message provided"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to process chat request"
}
```

#### Flow Diagram
```
Request with user message
        ↓
Create embedding vector
        ↓
Search Astra DB (top 10 similar chunks)
        ↓
Build system prompt with retrieved context
        ↓
Call GPT-4 with streaming
        ↓
Stream response back to client
```

#### Response Headers
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

### 2. Upload Endpoint
**Upload and process FAQ documents**

#### Request
```
POST /api/upload
Content-Type: multipart/form-data
```

**Body (multipart form):**
```
file: <File>  (TXT, PDF, or Markdown)
```

**Supported file formats:**
- `.txt` - Plain text
- `.pdf` - PDF documents  
- `.md` - Markdown files

**Max file size:** ~50MB (depends on server config)

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@faq.txt"
```

**Example (JavaScript):**
```javascript
const formData = new FormData()
formData.append("file", fileInput.files[0])

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData
})

const result = await response.json()
console.log(result)
```

#### Response
```
Status: 200 OK
Content-Type: application/json
```

**Success Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 25 chunks from faq.txt",
  "chunksProcessed": 25
}
```

**Error Response (400 - No file):**
```json
{
  "error": "No file provided"
}
```

**Error Response (400 - Empty file):**
```json
{
  "error": "File is empty"
}
```

**Error Response (500 - Server error):**
```json
{
  "error": "Failed to upload file"
}
```

#### Processing Steps
```
1. Receive file upload
        ↓
2. Read file content (TXT/PDF/Markdown)
        ↓
3. Split into chunks (512 chars, 100-char overlap)
        ↓
4. For each chunk:
   - Create embedding vector (OpenAI)
   - Store in Astra DB with metadata
        ↓
5. Return success with chunk count
```

#### Database Storage Format
```json
{
  "text": "FAQ chunk content...",
  "$vector": [0.123, 0.456, ...],  // 1536-dim vector
  "source": "faq.txt",
  "uploadedAt": "2026-05-05T13:00:00Z"
}
```

---

## 🔄 Data Flow

### Chat Flow
```
Client                    Server                  Astra DB         OpenAI
  │                         │                        │                │
  ├─ POST /api/chat ───────→ │                        │                │
  │  {message}              │                        │                │
  │                         ├─ Create Embedding ────────────────────→ │
  │                         │                        │                │
  │                         │                   ← Vector ─────────────┤
  │                         │                        │                │
  │                         ├─ Vector Search ──────→ │                │
  │                         │                        │                │
  │                   ← Top 10 chunks ──────────────┤                │
  │                         │                        │                │
  │                         ├─ Stream Response ──────────────────────→│
  │                         │                        │                │
  │ ← Streamed text ────────┤                        │                │
  │                   (GPT-4 output)                  │                │
```

### Upload Flow
```
Client              Server           OpenAI          Astra DB
  │                   │                │               │
  ├─ Upload file ───→ │                │               │
  │                   │                │               │
  │                   ├─ Split chunks  │               │
  │                   │ (512 chars)    │               │
  │                   │                │               │
  │    ┌──────────────┼─ Create vector─→               │
  │    │              │                │               │
  │    │              │              ← Vector ────────│
  │    │              │                │               │
  │    │              ├─ Store ────────────────────→  │
  │    │              │                │               │
  │    │              ├────────────────────────────→  │
  │    └──────────────┤ (repeat for all chunks)        │
  │                   │                │               │
  │ ← Success ────────┤                │               │
  │ (chunks processed)│                │               │
```

---

## 📊 Data Models

### Message
```typescript
interface Message {
  id: string           // UUID
  content: string      // Message text
  role: "user" | "assistant"
}
```

### Conversation
```typescript
interface Conversation {
  id: string           // UUID
  title: string        // Display name
  messages: Message[]  // Array of messages
}
```

### Upload Response
```typescript
interface UploadResponse {
  success: boolean
  message: string
  chunksProcessed: number
}
```

### Vector Search Result
```typescript
interface VectorSearchResult {
  text: string         // Chunk content
  source: string       // File name
  score: number        // Similarity score
}
```

---

## 🧪 Testing with Postman

### Import Collection
```json
{
  "info": {
    "name": "F1GPT API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Chat",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:3000/api/chat",
        "body": {
          "mode": "raw",
          "raw": "{\"messages\":[{\"id\":\"1\",\"content\":\"Hello\",\"role\":\"user\"}]}"
        }
      }
    },
    {
      "name": "Upload",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/upload",
        "body": {"mode": "formdata"}
      }
    }
  ]
}
```

---

## 🛠️ Status Codes

| Code | Meaning |
|------|---------|
| **200** | Success |
| **400** | Bad Request (missing/invalid parameters) |
| **500** | Server Error |

---

## ⚠️ Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Description of what went wrong"
}
```

**Example error responses:**
```json
{"error": "No file provided"}
{"error": "File is empty"}
{"error": "No message provided"}
{"error": "Failed to process chat request"}
{"error": "Failed to upload file"}
```

---

## 🔗 Environment Variables Required

```env
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
OPEN_AI_API_KEY=sk-proj-...
```

---

## 📈 Performance Notes

- **Chat response time:** 2-5 seconds (depends on network & OpenAI)
- **Vector search:** <100ms (Astra DB)
- **Streaming:** Real-time token streaming
- **Upload processing:** ~100ms per chunk (depending on file size)

---

## 🔒 Rate Limiting

Currently no rate limiting. For production, consider:
- Implementing token-based rate limiting
- Adding request throttling
- Monitoring API usage

---

## 🚀 Deployment Notes

When deploying to production:
1. Use environment variables for all secrets
2. Set up CORS if frontend is on different domain
3. Consider adding authentication
4. Implement rate limiting
5. Monitor API costs (OpenAI)
6. Add request logging

---

## 📞 Support

For issues:
1. Check `.env` file configuration
2. Review server logs in terminal
3. Verify OpenAI API key has credits
4. Ensure Astra DB connection is active

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0
