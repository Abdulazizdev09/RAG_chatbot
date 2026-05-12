# 📂 F1GPT Project Structure Guide

## Overview
```
rag_chatbot/
├── app/                    ← Next.js App Router (Frontend + Backend)
├── lib/                    ← Reusable backend utilities
├── types/                  ← TypeScript type definitions
├── scripts/                ← Utility scripts
├── .env                    ← Environment variables
└── Configuration files
```

---

## 📂 Detailed Structure

### `/app` - Next.js App Router

#### `/app/api` - Backend API Routes
```
app/api/
├── chat/
│   └── route.ts           ← POST /api/chat (AI responses)
│       • Creates embeddings from user query
│       • Searches Astra DB for context
│       • Streams GPT-4 responses
│
└── upload/
    └── route.ts           ← POST /api/upload (FAQ upload)
        • Accepts file uploads (TXT, PDF, MD)
        • Chunks text into 512-char segments
        • Creates embeddings for each chunk
        • Stores in Astra DB
```

**Key Functions:**
- `POST /api/chat` → Stream chat responses
- `POST /api/upload` → Process & store FAQ documents

---

#### `/app/components` - React Components

```
app/components/
├── Bubble.tsx              ← Individual message display
│   Props: { message: Message }
│   Shows user/assistant messages with styling
│
├── Sidebar.tsx             ← Conversation history sidebar
│   Props: {
│     onNewChat,
│     onSelectHistory,
│     onThemeToggle,
│     onUploadClick,
│     chatHistory,
│     activeChat
│   }
│   Features: New chat, history, theme toggle, upload
│
├── UploadModal.tsx         ← File upload modal dialog
│   Props: {
│     isOpen,
│     onClose,
│     onUpload,
│     isLoading
│   }
│   Features: Drag-drop, file browser, progress
│
├── LoadingBubble.tsx       ← Animated loading indicator
│   Animated dots while waiting for response
│
├── PromptSuggestionsRow.tsx ← Container for suggestions
│   Grid of suggested questions
│
└── PromptSuggestionButton.tsx ← Individual suggestion button
    Clickable prompt suggestion
```

---

#### `/app` - Page & Layout

```
app/
├── page.tsx                ← Main chat page
│   • Conversation state management
│   • Message handling
│   • Upload modal logic
│   • Theme management
│
├── layout.tsx              ← Root HTML layout
│   • <html>, <head>, <body>
│   • Global fonts & meta tags
│   • suppressHydrationWarning
│
└── global.css              ← Global styles
    • CSS variables (light/dark mode)
    • Component styles
    • Responsive design
    • Animations
```

---

#### `/app/assets` - Static Files

```
app/assets/
└── f1_image.webp           ← F1GPT logo (40KB optimized)
```

---

### `/lib` - Backend Utilities

**Purpose:** Centralized, reusable backend logic

```
lib/
├── astra.ts                ← Astra DB client & functions
│   Exports:
│   • getAstraCollection(name) → Get collection
│   • createAstraCollection(name, dim) → Create collection
│   • Default: db client instance
│
├── openai.ts               ← OpenAI API functions
│   Exports:
│   • createEmbedding(text) → Get vector (1536-dim)
│   • generateChatResponse(messages) → Stream response
│   • Default: OpenAI client instance
│
└── splitter.ts             ← Text chunking utility
    Exports:
    • splitText(text) → Array of chunks (512 chars, 100 overlap)
    • Default: splitter instance
```

**Why separate utilities?**
- ✅ Code reusability
- ✅ Easier testing
- ✅ Cleaner API routes
- ✅ Maintainability

---

### `/types` - TypeScript Definitions

```
types/
└── index.ts                ← All type definitions
    Interfaces:
    • Message - Chat message
    • Conversation - Chat session
    • UploadResponse - Upload result
    • VectorSearchResult - Search result
```

---

### `/scripts` - Utility Scripts

```
scripts/
└── loadDb.ts               ← Database initialization
    Usage: npm run seed
    • Scrapes F1 data from websites (Puppeteer)
    • Chunks text (LangChain)
    • Creates embeddings
    • Populates Astra DB
    • Run once to initialize knowledge base
```

---

### Configuration Files

```
Root/
├── .env                    ← Environment variables
│   • ASTRA_DB_* variables
│   • OPEN_AI_API_KEY
│
├── .env.example            ← Template (version control safe)
│
├── package.json            ← Dependencies & scripts
│   • npm run dev
│   • npm run build
│   • npm run start
│   • npm run seed
│   • npm run lint
│
├── tsconfig.json           ← TypeScript configuration
│   • Path aliases (@/...)
│   • Strict mode
│   • Module settings
│
├── next.config.ts          ← Next.js configuration
│   • Custom webpack config
│   • Image optimization
│   • Build settings
│
├── eslint.config.mjs        ← ESLint rules
│   • Code quality checks
│
├── postcss.config.mjs       ← PostCSS configuration
│   • CSS processing
│
├── tsconfig.json           ← TypeScript paths
│   • @/ = app/
│   • @/lib = lib/
│   • @/types = types/
```

---

## 🔄 Data Flow

### Folder Organization

```
┌─ Frontend Layer ─────┐
│  app/components/     │  ← User Interface
│  app/page.tsx        │
│  app/global.css      │
│  app/assets/         │
└──────────────────────┘
           ↓
┌─ API Layer ──────────┐
│  app/api/chat        │  ← Request Handlers
│  app/api/upload      │
└──────────────────────┘
           ↓
┌─ Backend Utilities ──┐
│  lib/astra.ts        │  ← Business Logic
│  lib/openai.ts       │
│  lib/splitter.ts     │
└──────────────────────┘
           ↓
┌─ External Services ──┐
│  Astra DB            │  ← Data & AI
│  OpenAI API          │
└──────────────────────┘
```

---

## 🗂️ File Relationships

```
page.tsx (Main)
  ├─ Imports: Sidebar, UploadModal, Bubble, LoadingBubble
  ├─ Calls: /api/chat (fetch)
  ├─ Calls: /api/upload (fetch)
  └─ State: conversations, activeConversationId

  ↓

/api/chat/route.ts
  ├─ Imports: lib/astra, lib/openai
  ├─ Calls: createEmbedding()
  ├─ Calls: getAstraCollection()
  └─ Returns: Streamed response

  ↓

lib/openai.ts
  ├─ Imports: OpenAI client
  ├─ Exports: createEmbedding(), generateChatResponse()
  └─ Uses: OpenAI API

  ↓

lib/astra.ts
  ├─ Imports: Astra DB client
  ├─ Exports: getAstraCollection(), createAstraCollection()
  └─ Uses: Astra DB Vector DB
```

---

## 📊 Component Hierarchy

```
<RootLayout>
  <Home (page.tsx)>
    <Sidebar>
      - New Chat Button
      - Chat History
      - Theme Toggle
      - Upload Button
    <ChatContainer>
      <ChatHeader>
        - Logo
        - Title
      <MessagesSection>
        <Bubble> (multiple)
        <LoadingBubble> (conditional)
      <ChatForm>
        - Input
        - Send Button
    <UploadModal>
      - File Drag Zone
      - Cancel Button
```

---

## 🔐 Separation of Concerns

| Layer | Purpose | Location |
|-------|---------|----------|
| **UI Rendering** | React components | `/app/components/` |
| **Page Logic** | State, hooks, workflows | `/app/page.tsx` |
| **API Handlers** | Request/response | `/app/api/` |
| **Business Logic** | Astra/OpenAI operations | `/lib/` |
| **Type Safety** | TypeScript interfaces | `/types/` |
| **Styling** | CSS & themes | `/app/global.css` |

---

## 📦 Build & Output

After `npm run build`:

```
.next/
├── static/          ← Compiled components
├── server/          ← Server-side code
└── public/          ← Static assets
```

---

## ✨ Best Practices Used

✅ **Lib folder** - Reusable backend logic  
✅ **Types folder** - Centralized TypeScript types  
✅ **API routes** - Serverless backend  
✅ **Components folder** - Organized UI  
✅ **Global CSS** - Single source of styling  
✅ **Environment variables** - Secure secrets  
✅ **Path aliases** - Clean imports (@/)  

---

## 🚀 Adding New Features

### Add a new API endpoint:
1. Create `/app/api/feature/route.ts`
2. Export `POST`, `GET`, etc.
3. Import utilities from `/lib/`
4. Return `NextResponse`

### Add a new component:
1. Create `/app/components/FeatureName.tsx`
2. Export React component
3. Import in `page.tsx` or other components

### Add new utility:
1. Create `/lib/feature.ts`
2. Export functions
3. Import in API routes

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0
