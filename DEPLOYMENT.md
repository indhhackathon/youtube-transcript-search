# Deployment Guide

This guide covers deploying the YouTube Keyword Finder to production.

## Prerequisites

- YouTube Data API v3 key
- MongoDB Atlas account (free tier available)
- Redis Cloud account (free tier available)
- Meilisearch Cloud account or self-hosted instance
- Vercel account (for frontend)
- Render/Railway account (for backend)

## Step 1: Set Up Cloud Services

### MongoDB Atlas

1. Go to https://www.mongodb.com/atlas
2. Create a free M0 cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for simplicity, or restrict to your backend IPs
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/youtube-keywords?retryWrites=true&w=majority
   ```

### Redis Cloud

1. Go to https://redis.com/try-free/
2. Create a free database (30MB)
3. Note down the connection details
4. Get your connection string:
   ```
   redis://default:<password>@<host>:<port>
   ```

### Meilisearch Cloud

**Option A: Cloud (Recommended)**
1. Go to https://www.meilisearch.com/cloud
2. Sign up and create an instance
3. Note the host URL and API key

**Option B: Self-hosted on Render**
1. Create new Web Service on Render
2. Use Docker image: `getmeili/meilisearch:v1.5`
3. Add environment variable: `MEILI_MASTER_KEY=your_secure_key`
4. Note the URL after deployment

## Step 2: Deploy Backend

### Using Render

1. **Create Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `youtube-keyword-finder-api`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_atlas_uri>
   REDIS_URL=<your_redis_cloud_uri>
   MEILISEARCH_HOST=<your_meilisearch_host>
   MEILISEARCH_API_KEY=<your_meilisearch_key>
   YOUTUBE_API_KEY=<your_youtube_api_key>
   CACHE_TTL=3600
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-app.onrender.com`

### Using Railway

1. **Create Project**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure**
   - Select repository
   - Set root directory: `backend`
   - Railway auto-detects Node.js

3. **Add Environment Variables**
   (Same as Render above, but update CORS_ORIGIN to your frontend URL)

4. **Deploy**
   - Railway automatically deploys
   - Note your backend URL

## Step 3: Deploy Frontend

### Using Vercel

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variable**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your frontend URL: `https://your-app.vercel.app`

5. **Update Backend CORS**
   - Go back to Render/Railway
   - Update `CORS_ORIGIN` environment variable with your Vercel URL
   - Redeploy backend

## Step 4: Verify Deployment

1. **Test Backend API**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

2. **Test Search Endpoint**
   ```bash
   curl "https://your-backend-url.onrender.com/api/search?q=test"
   ```

3. **Test Frontend**
   - Visit your Vercel URL
   - Try searching for a keyword
   - Verify results appear correctly

## Step 5: Production Optimization

### Backend

1. **Enable Compression** (Already included)
   - gzip compression for responses

2. **Monitor Logs**
   - Check Render/Railway logs for errors
   - Monitor MongoDB Atlas metrics

3. **Scale Resources**
   - Upgrade Render/Railway plan if needed
   - Scale MongoDB cluster for higher traffic

### Frontend

1. **Enable Analytics**
   - Add Vercel Analytics
   - Monitor page performance

2. **Optimize Images**
   - Next.js Image component (already used)
   - Automatic image optimization

3. **CDN Configuration**
   - Vercel automatically uses CDN
   - Edge functions for global distribution

## Environment Variables Checklist

### Backend (Render/Railway)
- ✅ `PORT`
- ✅ `NODE_ENV`
- ✅ `MONGODB_URI`
- ✅ `REDIS_URL`
- ✅ `MEILISEARCH_HOST`
- ✅ `MEILISEARCH_API_KEY`
- ✅ `YOUTUBE_API_KEY`
- ✅ `CACHE_TTL`
- ✅ `CORS_ORIGIN`
- ✅ `RATE_LIMIT_WINDOW_MS`
- ✅ `RATE_LIMIT_MAX_REQUESTS`

### Frontend (Vercel)
- ✅ `NEXT_PUBLIC_API_URL`

## Monitoring & Maintenance

### Performance Monitoring

1. **Backend**
   - Monitor response times in Render/Railway dashboard
   - Check MongoDB Atlas performance metrics
   - Monitor Redis Cloud memory usage

2. **Frontend**
   - Use Vercel Analytics
   - Monitor Core Web Vitals
   - Check error rates

### Logging

1. **Backend Logs**
   - View logs in Render/Railway dashboard
   - Winston logs stored in `logs/` directory
   - Monitor error.log for issues

2. **Frontend Logs**
   - Vercel deployment logs
   - Browser console for client errors

### Backup Strategy

1. **MongoDB**
   - Atlas provides automatic backups
   - Create manual snapshots before major changes

2. **Redis**
   - Redis Cloud provides persistence
   - Data can be rebuilt from MongoDB if needed

## Troubleshooting

### Backend Issues

**"Cannot connect to MongoDB"**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check database user permissions

**"Redis connection failed"**
- Verify Redis Cloud connection string
- Check Redis Cloud instance status
- App continues to work without cache

**"Rate limit exceeded"**
- Adjust `RATE_LIMIT_MAX_REQUESTS` higher
- Consider upgrading plan for more capacity

### Frontend Issues

**"Cannot connect to API"**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Ensure backend is deployed and running

**"Build failed"**
- Check Vercel build logs
- Verify all dependencies in package.json
- Clear Vercel cache and redeploy

## Cost Estimates (Monthly)

### Free Tier
- **MongoDB Atlas**: Free (M0 cluster, 512MB storage)
- **Redis Cloud**: Free (30MB)
- **Meilisearch**: Self-host on Render free tier
- **Render**: Free (750 hours/month)
- **Vercel**: Free (100GB bandwidth)
- **Total**: $0/month (within free tier limits)

### Production Tier (High Traffic)
- **MongoDB Atlas**: $57/month (M10 cluster)
- **Redis Cloud**: $10/month (250MB)
- **Meilisearch Cloud**: $29/month (starter)
- **Render**: $7/month (starter)
- **Vercel**: $20/month (pro)
- **Total**: ~$123/month

## Security Checklist

- ✅ Use environment variables for secrets
- ✅ Enable CORS with specific origins
- ✅ Implement rate limiting
- ✅ Use Helmet.js for security headers
- ✅ Keep dependencies updated
- ✅ Monitor for vulnerabilities
- ✅ Use HTTPS everywhere (automatic on Vercel/Render)

## Support

If you encounter issues during deployment:
1. Check service status pages
2. Review deployment logs
3. Verify environment variables
4. Test API endpoints individually
5. Open an issue on GitHub

---

Happy Deploying! 🚀
