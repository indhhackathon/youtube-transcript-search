# YouTube Keyword Finder 🎥🔍

A production-ready, high-performance web application that lets users search YouTube videos by transcript keywords. Find exactly where specific words or phrases are mentioned in videos, with instant results powered by caching and full-text search.

## Features

- **🔍 Keyword Search**: Search for any keyword or phrase across YouTube video transcripts
- **⚡ Blazing Fast**: Redis caching (1-hour TTL) + Meilisearch indexing for instant results
- **📊 Rich Results**: Get video title, channel, thumbnail, and exact timestamp links
- **🎯 Precise Matching**: See exactly where and how many times keywords appear
- **💾 Smart Storage**: MongoDB stores transcripts for future searches
- **🚀 Production Ready**: Rate limiting, compression, security headers, error handling
- **📱 Responsive UI**: Beautiful Next.js + Tailwind CSS interface

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Next.js   │ ──────▶ │   Express    │ ──────▶ │  YouTube    │
│  Frontend   │         │   Backend    │         │  Data API   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
         │   MongoDB   │ │ Redis  │ │Meilisearch │
         │  (Storage)  │ │(Cache) │ │  (Search)  │
         └─────────────┘ └────────┘ └────────────┘
```

## Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API server
- **MongoDB**: Video and transcript storage
- **Redis**: Response caching (1-hour TTL)
- **Meilisearch**: Full-text search indexing
- **YouTube Data API v3**: Video search
- **youtube-transcript**: Transcript fetching

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client

### DevOps
- **Docker** + **Docker Compose**: Containerization
- **Helmet**: Security headers
- **Compression**: Response compression
- **Winston**: Logging
- **Express Rate Limit**: Rate limiting

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- YouTube Data API v3 key ([Get one here](https://console.cloud.google.com/apis/credentials))

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/youtube-keyword-finder.git
   cd youtube-keyword-finder
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your YOUTUBE_API_KEY
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Meilisearch: http://localhost:7700

### Option 2: Manual Setup

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB, Redis, and Meilisearch**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   docker run -d -p 6379:6379 --name redis redis:7-alpine
   docker run -d -p 7700:7700 --name meilisearch \
     -e MEILI_MASTER_KEY=masterKey123 \
     getmeili/meilisearch:v1.5
   ```

4. **Start the backend**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Start the frontend**
   ```bash
   npm run dev  # Development
   npm run build && npm start  # Production
   ```

## API Documentation

### Search Endpoint

**GET** `/api/search`

Search for videos by keyword in transcripts.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Keyword or phrase to search |
| `limit` | number | No | 10 | Maximum number of results |
| `useCache` | boolean | No | true | Use Redis cache |

#### Example Request

```bash
curl "http://localhost:5000/api/search?q=artificial%20intelligence&limit=5"
```

#### Example Response

```json
{
  "success": true,
  "cached": false,
  "keyword": "artificial intelligence",
  "results": [
    {
      "videoId": "dQw4w9WgXcQ",
      "title": "Understanding AI",
      "channel": "Tech Channel",
      "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "matchCount": 3,
      "snippet": "...talking about <mark>artificial intelligence</mark> and its impact...",
      "matches": [
        {
          "text": "We're talking about artificial intelligence today",
          "start": 45.2,
          "duration": 3.5,
          "timestampUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ&t=45s"
        }
      ]
    }
  ],
  "count": 1
}
```

### Health Check

**GET** `/api/health`

Check API and service health.

```bash
curl http://localhost:5000/api/health
```

## Configuration

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/youtube-keywords

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_master_key

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Cache
CACHE_TTL=3600

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Performance Optimization

### Caching Strategy
- **Redis**: Caches search results for 1 hour
- **Meilisearch**: Indexes transcript text for sub-second searches
- **MongoDB**: Stores transcripts to avoid re-fetching

### Scalability Features
- Connection pooling (MongoDB)
- Response compression (gzip)
- Rate limiting (100 requests per 15 minutes)
- Async/await throughout
- Efficient database indexing

## Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Render / Railway (Backend)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add all environment variables
6. Deploy

### MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in environment variables

### Redis Cloud

1. Create free instance at [redis.com/try-free](https://redis.com/try-free/)
2. Get connection URL
3. Update `REDIS_URL` in environment variables

### Meilisearch Cloud

1. Sign up at [meilisearch.com](https://www.meilisearch.com/)
2. Create instance
3. Update `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY`

## Project Structure

```
youtube-keyword-finder/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js              # Environment configuration
│   │   │   └── logger.js           # Winston logger setup
│   │   ├── db/
│   │   │   ├── mongo.js            # MongoDB connection
│   │   │   └── models/
│   │   │       └── Video.js        # Video schema
│   │   ├── routes/
│   │   │   └── search.js           # Search endpoint
│   │   ├── services/
│   │   │   ├── cache.js            # Redis caching
│   │   │   ├── captions.js         # Transcript fetching
│   │   │   ├── meilisearch.js      # Search indexing
│   │   │   └── youtube.js          # YouTube API
│   │   └── index.js                # Express server
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main page
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── SearchBar.tsx           # Search input
│   │   ├── VideoCard.tsx           # Video result card
│   │   ├── VideoGrid.tsx           # Results grid
│   │   └── LoadingSpinner.tsx      # Loading state
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### "Transcript is not available for this video"
Some videos don't have transcripts enabled. The app will skip these videos.

### "Cannot connect to API"
Make sure the backend is running on the correct port and the `NEXT_PUBLIC_API_URL` is set correctly.

### "Redis not connected"
The app will work without Redis, but results won't be cached. Check Redis connection settings.

### "Meilisearch search failed"
The app falls back to YouTube API if Meilisearch fails. Check Meilisearch host and API key.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [youtube-transcript](https://github.com/Kakulukian/youtube-transcript-api)
- [Meilisearch](https://www.meilisearch.com/)
- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API error messages

---

Built with ❤️ using Node.js, Next.js, MongoDB, Redis, and Meilisearch
