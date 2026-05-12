# 🚀 F1GPT Deployment Guide

Complete instructions for deploying F1GPT to production on Vercel, AWS, Docker, and other platforms.

---

## 🎯 Quick Deploy (Vercel - Recommended)

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository

### Step 3: Add Environment Variables
In Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add these variables:

```
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://your-endpoint.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token
OPEN_AI_API_KEY=sk-proj-your-key
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-5 minutes
3. Visit your live URL (e.g., `f1gpt.vercel.app`)

**That's it!** Your app is live.

---

## 📋 Pre-Deployment Checklist

Before deploying anywhere, verify:

- [ ] All environment variables are set
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] All features tested in dev mode
- [ ] .env file is NOT in git (check .gitignore)
- [ ] OpenAI API has sufficient credits
- [ ] Astra DB cluster is active

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Build & Run
```bash
# Build image
docker build -t f1gpt:latest .

# Run container
docker run -p 3000:3000 \
  -e ASTRA_DB_NAMESPACE=default_keyspace \
  -e ASTRA_DB_COLLECTION=f1gpt \
  -e ASTRA_DB_API_ENDPOINT=https://... \
  -e ASTRA_DB_APPLICATION_TOKEN=AstraCS:... \
  -e OPEN_AI_API_KEY=sk-proj-... \
  f1gpt:latest
```

### Step 3: Push to Docker Hub
```bash
docker tag f1gpt:latest yourname/f1gpt:latest
docker push yourname/f1gpt:latest
```

---

## ☁️ AWS Deployment (EC2)

### Step 1: Create EC2 Instance
1. AWS Console → EC2
2. Create instance:
   - AMI: Ubuntu 22.04 LTS
   - Type: t3.micro (free tier eligible)
   - Storage: 20GB

### Step 2: Connect & Setup
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 3: Deploy Code
```bash
# Clone repository
git clone <your-repo-url>
cd rag_chatbot

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
OPEN_AI_API_KEY=sk-proj-...
EOF

# Build & start
npm run build
pm2 start npm --name "f1gpt" -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Step 4: Setup Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Create config
sudo cat > /etc/nginx/sites-available/f1gpt << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/f1gpt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔵 Google Cloud Run

### Step 1: Create GCP Project
```bash
# Create project
gcloud projects create f1gpt-project

# Set as default
gcloud config set project f1gpt-project
```

### Step 2: Create Dockerfile (same as Docker section above)

### Step 3: Deploy
```bash
# Build & push to Container Registry
gcloud builds submit --tag gcr.io/f1gpt-project/f1gpt

# Deploy to Cloud Run
gcloud run deploy f1gpt \
  --image gcr.io/f1gpt-project/f1gpt \
  --platform managed \
  --region us-central1 \
  --set-env-vars ASTRA_DB_NAMESPACE=default_keyspace,... \
  --allow-unauthenticated
```

---

## 🟢 Heroku Deployment (Legacy - Not Recommended)

Heroku now charges for dyos. Use Vercel or Railway instead.

---

## 🚂 Railway Deployment

### Step 1: Create Railway Account
Go to [railway.app](https://railway.app) and sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize and select your repository

### Step 3: Add Environment Variables
1. Project → Variables
2. Add all environment variables

### Step 4: Deploy
Railway automatically deploys on every git push.

---

## 🔄 Environment Variables by Platform

### Vercel
Dashboard → Project Settings → Environment Variables

### AWS EC2
Create `.env` file in application directory

### Docker
Pass via `-e` flags or `docker-compose.yml`:
```yaml
services:
  app:
    image: f1gpt:latest
    environment:
      - ASTRA_DB_NAMESPACE=default_keyspace
      - ASTRA_DB_COLLECTION=f1gpt
      - ASTRA_DB_API_ENDPOINT=https://...
      - ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
      - OPEN_AI_API_KEY=sk-proj-...
    ports:
      - "3000:3000"
```

### GCP Cloud Run
Use `--set-env-vars` or Cloud Run UI

---

## 🔒 Security Checklist

### Before Going Live

- [ ] Never commit `.env` file
- [ ] Use `--build` cache only for verified images
- [ ] Enable HTTPS (SSL/TLS certificate)
- [ ] Add rate limiting to API endpoints
- [ ] Set up monitoring & alerting
- [ ] Enable CORS only for trusted domains
- [ ] Add API key rotation policy
- [ ] Enable database backups
- [ ] Monitor OpenAI API costs

### Code Security

```javascript
// Add rate limiting
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## 📊 Monitoring & Logging

### Vercel Analytics
- Dashboard → Analytics
- Real-time metrics & performance

### Custom Logging
```typescript
// app/api/chat/route.ts
console.log(`[${new Date().toISOString()}] Chat request from ${req.headers.get("user-agent")}`)
```

### Monitoring Services
- **Datadog**: Real-time monitoring
- **New Relic**: Performance monitoring
- **LogRocket**: Error tracking
- **Sentry**: Exception monitoring

---

## 💰 Cost Estimates

| Service | Cost |
|---------|------|
| **Vercel** | $0-20/month (pay-as-you-go) |
| **Astra DB** | $0-100/month (free tier available) |
| **OpenAI API** | Depends on usage (~$0.01 per 1K tokens) |
| **AWS EC2** | $10-50/month (depending on instance) |
| **Google Cloud Run** | $0-10/month (free tier available) |

---

## 🚨 Troubleshooting Deployment

### Issue: Build fails on Vercel
```bash
# Check local build
npm run build

# Check for TypeScript errors
npm run lint

# Verify all dependencies
npm install
```

### Issue: Environment variables not loading
- Verify variable names match exactly
- Redeploy after adding variables
- Check `.env` file in development

### Issue: 502 Bad Gateway
- Check if process is running: `pm2 status`
- Check logs: `pm2 logs f1gpt`
- Verify port 3000 is open
- Check Astra DB connection

### Issue: Astra DB connection timeout
- Verify IP whitelist includes deployment IP
- Check token hasn't expired
- Verify endpoint URL is correct

### Issue: High OpenAI costs
- Set rate limiting on API
- Monitor token usage
- Implement caching for responses
- Set spending alerts in OpenAI dashboard

---

## 📈 Performance Optimization

### Enable Caching
```typescript
// API response caching
res.setHeader('Cache-Control', 'public, max-age=300');
```

### Enable Compression
```typescript
// Vercel automatically compresses responses
// For self-hosted, use nginx gzip
```

### Database Optimization
- Create indexes on frequently searched fields
- Archive old conversations
- Implement pagination

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx vercel deploy --prod
```

---

## 📞 Support

- **Vercel Issues**: vercel.com/support
- **Astra DB Issues**: datastax.com/support
- **OpenAI Issues**: platform.openai.com/help

---

**Last Updated:** May 5, 2026
**Version:** 1.0.0
