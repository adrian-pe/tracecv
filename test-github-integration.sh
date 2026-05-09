#!/bin/bash
# GitHub Integration Testing Script
# Run this to test the GitHub integration endpoints

API_URL="http://localhost:3001/api"

echo "🧪 TraceCV GitHub Integration Tests"
echo "===================================="
echo ""

# Test 1: Connect a GitHub user
echo "1️⃣  Testing GitHub profile connection..."
echo "POST $API_URL/github/octocat"
echo ""

curl -X POST "$API_URL/github/octocat" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' \
  -s | jq '.'

echo ""
echo ""

# Test 2: Get the user profile with extracted skills
echo "2️⃣  Getting user profile with extracted skills..."
echo "GET $API_URL/profile/1"
echo ""

curl -X GET "$API_URL/profile/1" \
  -s | jq '.'

echo ""
echo ""

# Test 3: Create a manual activity
echo "3️⃣  Creating a manual activity (for comparison)..."
echo "POST $API_URL/activities"
echo ""

curl -X POST "$API_URL/activities" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "event",
    "source": "luma",
    "title": "Web3 Solidity Workshop",
    "url": "https://example.com"
  }' \
  -s | jq '.'

echo ""
echo ""

# Test 4: Get profile for the second user
echo "4️⃣  Getting profile for user 2..."
echo "GET $API_URL/profile/2"
echo ""

curl -X GET "$API_URL/profile/2" \
  -s | jq '.'

echo ""
echo "✅ Tests complete!"
