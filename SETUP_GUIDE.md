# 🚀 F1GPT RAG Chatbot - Setup & Run Guide

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18+): [Download](https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js
- **Astra DB account**: [Create here](https://astra.datastax.com/)
- **OpenAI API key**: [Get here](https://platform.openai.com/api-keys)

---

## 🔧 Setup Instructions

### 1️⃣ Clone & Install Dependencies

```bash
# Navigate to project
cd rag_chatbot

# Install dependencies
npm install
```

### 2️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Astra DB Configuration
ASTRA_DB_NAMESPACE="default_keyspace"
ASTRA_DB_COLLECTION="f1gpt"
ASTRA_DB_API_ENDPOINT="https://your-astra-endpoint.apps.astra.datastax.com"
ASTRA_DB_APPLICATION_TOKEN="AstraCS:your-token-here"

# OpenAI Configuration
OPEN_AI_API_KEY="sk-proj-your-openai-key-here"
```

**Where to find these?**

| Variable | Location |
|----------|----------|
| `ASTRA_DB_API_ENDPOINT` | Astra Dashboard → Database Settings → Connection String |
| `ASTRA_DB_APPLICATION_TOKEN` | Astra Dashboard → Database Settings → Token |
| `OPEN_AI_API_KEY` | OpenAI Platform → API Keys |

---

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```
- Server starts at **http://localhost:3000**
- Hot reload enabled (changes auto-refresh)
- See logs in terminal

### Production Build
```bash
# Build optimized version
npm run build

# Start production server
npm start
```
- Optimized for performance
- Use this before deployment

### Seed Database (Optional)
To populate Astra DB with initial F1 data:
```bash
npm run seed
```
- Scrapes F1 data from websites
- Vectorizes and stores in Astra DB
- Run once to initialize knowledge base

---

## 📁 Project Structure

```
rag_chatbot/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       ← Chat endpoint (POST /api/chat)
│   │   └── upload/route.ts     ← Upload endpoint (POST /api/upload)
│   ├── components/
│   │   ├── Bubble.tsx          ← Message bubble
│   │   ├── Sidebar.tsx         ← Chat history sidebar
│   │   ├── UploadModal.tsx     ← Upload dialog
│   │   ├── LoadingBubble.tsx   ← Loading indicator
│   │   └── PromptSuggestions*  ← Suggested prompts
│   ├── assets/
│   │   └── f1_image.webp       ← Logo
│   ├── page.tsx                ← Main page (conversation management)
│   ├── layout.tsx              ← Root layout
│   └── global.css              ← Global styles (dark/light mode)
│
├── lib/                        ← Backend utilities
│   ├── astra.ts                ← Astra DB client & functions
│   ├── openai.ts               ← OpenAI embeddings & chat
│   └── splitter.ts             ← Text chunking utility
│
├── types/
│   └── index.ts                ← TypeScript interfaces
│
├── scripts/
│   └── loadDb.ts               ← Database seeding script
│
├── .env                        ← Environment variables
├── package.json                ← Dependencies
├── tsconfig.json               ← TypeScript config
├── next.config.ts              ← Next.js config
└── README.md                   ← Project readme
```

---

## 🧪 Testing the App

### 1. Open the App
```
http://localhost:3000
```

### 2. Ask a Question
- Type: "Who is the current F1 champion?"
- Click "Send"
- AI responds with streamed answer

### 3. Upload FAQ
- Click "📤 Upload FAQ" button
- Drag & drop a TXT/PDF/Markdown file
- File is processed and added to knowledge base
- Questions will now reference this data

### 4. Chat History
- New conversations appear in sidebar
- Click to switch between conversations
- Click "➕" for new chat

### 5. Theme Toggle
- Click "🌙" button
- Follows your system preference (light/dark mode)

---

## 📡 API Endpoints

### POST /api/chat
**Chat with the AI**

**Request:**
```json
{
  "messages": [
    {
      "id": "msg-1",
      "content": "Who is the current F1 champion?",
      "role": "user"
    }
  ]
}
```

**Response:** Streaming text response (SSE)

---

### POST /api/upload
**Upload FAQ Document**

**Request:**
```
Content-Type: multipart/form-data

file: <TXT, PDF, or Markdown file>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 12 chunks from faq.txt",
  "chunksProcessed": 12
}
```

---

## 🔍 How It Works

```
User Question
    ↓
Create Embedding (OpenAI)
    ↓
Search Astra DB (Vector Search)
    ↓
Retrieve Top 10 Relevant Chunks
    ↓
Build Context for LLM
    ↓
Generate Answer (GPT-4)
    ↓
Stream Response to Client
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 3000 in use** | Kill process: `taskkill /PID 6628 /F` or change port: `npm run dev -- -p 3001` |
| **"ENOTFOUND api.openai.com"** | Check OpenAI API key in `.env` |
| **"Connection refused" to Astra** | Verify Astra endpoint & token in `.env` |
| **No AI response** | Check server logs, ensure OpenAI API has credits |
| **File upload fails** | Ensure file is valid TXT/PDF/Markdown |

---

## 📦 Dependencies Explained

| Package | Purpose |
|---------|---------|
| **next** | React framework with API routes |
| **react** | UI library |
| **typescript** | Type-safe JavaScript |
| **openai** | OpenAI API client |
| **@datastax/astra-db-ts** | Vector database client |
| **langchain** | Text splitting/chunking |
| **puppeteer** | Web scraping (seed script) |

---

## 🚀 Deployment (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy!

```bash
vercel deploy
```

---

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Astra DB Docs](https://docs.datastax.com/en/astra/home/astra.html)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [LangChain Docs](https://js.langchain.com/)

---

## 💡 Tips

✅ **Optimize performance:** Upload comprehensive FAQ files to improve answer quality  
✅ **Cost savings:** Monitor OpenAI API usage in billing dashboard  
✅ **Local testing:** Use dev mode for faster development  
✅ **Dark mode:** System automatically detects your OS preference  

---

**Need help?** Check the [API Documentation](./API_DOCUMENTATION.md)
