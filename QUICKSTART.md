# Quick Start Guide

Get the YouTube Keyword Finder running in 5 minutes!

## 🚀 Fastest Way (Docker Compose)

### Prerequisites
- Docker Desktop installed
- YouTube Data API key ([Get one here](https://console.cloud.google.com/apis/credentials))

### Steps

1. **Clone and navigate**
   ```bash
   git clone <your-repo-url>
   cd youtube-keyword-finder
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   nano .env  # or use your favorite editor
   # Add your YOUTUBE_API_KEY
   ```

3. **Start everything**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to start** (30-60 seconds)

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

6. **Search for keywords!**
   - Try: "machine learning", "climate change", "AI ethics"

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

---

## 💻 Development Setup (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Redis running locally
- Meilisearch running locally
- YouTube API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

### Required Services

**MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Redis**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Meilisearch**
```bash
docker run -d -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey123 \
  --name meilisearch \
  getmeili/meilisearch:v1.5
```

---

## 🔑 Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Copy the API key to your `.env` file

---

## ✅ Verify Installation

1. **Check backend health**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Try a search**
   ```bash
   curl "http://localhost:5000/api/search?q=artificial%20intelligence"
   ```

3. **Open frontend**
   - Visit http://localhost:3000
   - Enter a keyword
   - See results!

---

## 🎯 Example Searches

Try these popular keywords:
- "machine learning"
- "climate change"
- "artificial intelligence"
- "quantum computing"
- "neural networks"

---

## 🐛 Common Issues

### "Cannot connect to API"
- Make sure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### "No results found"
- Some videos don't have transcripts
- Try a more common keyword
- Check YouTube API quota

### "Redis connection failed"
- App still works without Redis
- Results just won't be cached
- Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`

### "MongoDB connection error"
- Start MongoDB: `docker run -d -p 27017:27017 mongo:7`
- Check `MONGODB_URI` in backend `.env`

---

## 📚 Next Steps

- Read the full [README.md](README.md)
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Customize the UI in `frontend/components/`
- Adjust search logic in `backend/src/routes/search.js`

---

That's it! You're ready to search YouTube transcripts! 🎉
