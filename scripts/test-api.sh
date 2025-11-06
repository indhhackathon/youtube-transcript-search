#!/bin/bash

API_URL=${1:-http://localhost:5000}

echo "🧪 Testing YouTube Keyword Finder API"
echo "API URL: $API_URL"
echo ""

# Test health endpoint
echo "1️⃣ Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed"
    echo "Response: $RESPONSE_BODY"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi

echo ""

# Test search endpoint
echo "2️⃣ Testing search endpoint (keyword: 'test')..."
SEARCH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/search?q=test&limit=3")
HTTP_CODE=$(echo "$SEARCH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SEARCH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Search request successful"

    # Check if results exist
    RESULT_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    echo "Found $RESULT_COUNT results"

    # Pretty print JSON if jq is available
    if command -v jq &> /dev/null; then
        echo ""
        echo "Response preview:"
        echo "$RESPONSE_BODY" | jq '.results[0] | {videoId, title, channel, matchCount}'
    fi
else
    echo "❌ Search request failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "✅ API tests complete!"
