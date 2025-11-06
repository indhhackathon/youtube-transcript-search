#!/bin/bash

echo "🚀 Starting YouTube Keyword Finder"
echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✅ Docker Compose found"
    echo ""

    # Check if .env exists
    if [ ! -f .env ]; then
        echo "⚠️  .env file not found. Creating from template..."
        cp .env.example .env
        echo ""
        echo "❌ Please edit .env file and add your YOUTUBE_API_KEY"
        echo "Then run this script again."
        exit 1
    fi

    echo "🐳 Starting all services with Docker Compose..."
    echo ""

    # Try docker compose (newer) or docker-compose (older)
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ All services started successfully!"
        echo ""
        echo "📊 Service URLs:"
        echo "  - Frontend:     http://localhost:3000"
        echo "  - Backend API:  http://localhost:5000"
        echo "  - MongoDB:      mongodb://localhost:27017"
        echo "  - Redis:        redis://localhost:6379"
        echo "  - Meilisearch:  http://localhost:7700"
        echo ""
        echo "💡 View logs: docker compose logs -f"
        echo "🛑 Stop services: docker compose down"
        echo ""
    else
        echo ""
        echo "❌ Failed to start services"
        exit 1
    fi
else
    echo "❌ Docker Compose not found"
    echo ""
    echo "Please install Docker Desktop or start services manually:"
    echo "  1. Start MongoDB, Redis, and Meilisearch"
    echo "  2. cd backend && npm run dev"
    echo "  3. cd frontend && npm run dev"
    exit 1
fi
