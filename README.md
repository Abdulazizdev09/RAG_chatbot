# 🚀 F1GPT - RAG Chatbot with Dark Mode

A modern **AI-powered FAQ chatbot** for Formula 1 that uses **Retrieval-Augmented Generation (RAG)** to answer questions based on uploaded documents. Built with **Next.js**, **OpenAI**, and **Astra DB**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/next.js-16.2.4-black)
![React](https://img.shields.io/badge/react-19.2.4-61DAFB)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)

---

## ✨ Features

- 🤖 **AI Chat** - Powered by GPT-4, delivers concise responses
- 📚 **RAG (Retrieval-Augmented Generation)** - Searches uploaded knowledge base for context
- 📤 **Document Upload** - Add TXT/PDF/Markdown files to knowledge base
- 💬 **Conversation History** - Sidebar with chat history management
- 🌙 **Dark/Light Mode** - Auto-detects system preference + manual toggle
- ⚡ **Streaming Responses** - Real-time token streaming for better UX
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- 🔒 **Privacy** - Conversations stored locally in browser
- ⚙️ **Production-Ready** - Optimized for Vercel deployment

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Custom CSS with CSS variables (no Tailwind) |
| **Backend** | Node.js via Next.js API Routes |
| **LLM** | OpenAI (GPT-4 for responses, text-embedding-3-small for vectors) |
| **Vector DB** | Astra DB (DataStax) - serverless vector database |
| **Text Processing** | LangChain (RecursiveCharacterTextSplitter) |
| **Web Scraping** | Puppeteer (optional - for data seeding) |

---

## 🎯 Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key
- Astra DB account

### 2. Clone & Install
```bash
# Navigate to project
cd rag_chatbot

# Install dependencies
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
ASTRA_DB_NAMESPACE="default_keyspace"
ASTRA_DB_COLLECTION="f1gpt"
ASTRA_DB_API_ENDPOINT="https://your-endpoint.apps.astra.datastax.com"
ASTRA_DB_APPLICATION_TOKEN="AstraCS:your-token"
OPEN_AI_API_KEY="sk-proj-your-key"
```

### 4. Run Locally
```bash
npm run dev
```
Open **http://localhost:3000**

### 5. Upload FAQ (Optional)
- Click "📤 Upload FAQ"
- Drag and drop or select a TXT/PDF/Markdown file
- File is processed and added to knowledge base

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Detailed setup, troubleshooting, deployment |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API endpoints, request/response formats |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Code organization, file structure |

---

## 💻 Development

### Available Scripts

```bash
npm run dev      # Development server (hot reload)
npm run build    # Production build
npm start        # Start production server
npm run seed     # Populate Astra DB with data
npm run lint     # Check code quality
```

---

## 🏗️ Architecture

**Frontend**: React components in `/app/components`
**Backend**: API routes in `/app/api`
**Utilities**: Reusable logic in `/lib`
**Types**: TypeScript interfaces in `/types`

---

## 🧪 How It Works

```
User Question → Embedding Vector → Astra DB Search → GPT-4 Generation → Streamed Response
```

1. User types a question
2. Question is converted to vector embedding (1536-dim)
3. Astra DB searches for similar chunks
4. Top 10 results provide context
5. GPT-4 generates concise answer (2-4 sentences)
6. Response streams to browser in real-time

---

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build && npm start

# Deploy to Vercel
vercel deploy
```

---

## 📞 Need Help?

- **Setup Issues?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-troubleshooting)
- **API Usage?** → [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Code Questions?** → [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

**Version 1.0.0** | Last Updated: May 5, 2026
