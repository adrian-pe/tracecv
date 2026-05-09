# API Examples - Ready to Use

## Prerequisites
- API running on `http://localhost:3001`
- GitHub token configured (optional but recommended for higher rate limits)

---

## 🔌 GitHub Integration Examples

### 1. Connect GitHub User (Octocat - GitHub's mascot)

```bash
curl -X POST http://localhost:3001/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1
  }' | jq '.'
```

**What it does:**
- Fetches all public repos from @octocat
- Extracts programming languages
- Analyzes repository topics
- Detects skills automatically
- Stores activities and skills in database

---

### 2. Connect a Real Developer (Linus Torvalds)

```bash
curl -X POST http://localhost:3001/api/github/torvalds \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2
  }' | jq '.'
```

---

### 3. Connect Multiple GitHub Users to Same Profile

```bash
# Same user, different GitHub profiles
curl -X POST http://localhost:3001/api/github/torvalds \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' | jq '.'

curl -X POST http://localhost:3001/api/github/gvanrossum \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' | jq '.'
```

---

## 📊 Profile Examples

### 4. Get User Profile (View All Skills & Activities)

```bash
curl http://localhost:3001/api/profile/1 | jq '.'
```

**Response includes:**
- All detected skills (deduplicated)
- All activities (events + repositories)
- Comprehensive profile data

---

### 5. Get Specific User Profile

```bash
curl http://localhost:3001/api/profile/2 | jq '.'
```

---

## 🎯 Activity Management Examples

### 6. Create Manual Event Activity

```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "event",
    "source": "luma",
    "title": "Web3 Solidity Workshop",
    "url": "https://luma.com/event/abc123"
  }' | jq '.'
```

---

### 7. Create Conference Attendance

```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "event",
    "source": "conference",
    "title": "PyCon 2024 - Advanced Python Patterns",
    "url": "https://pycon.org/2024"
  }' | jq '.'
```

---

### 8. Create Course Completion Activity

```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "course",
    "source": "udemy",
    "title": "Advanced React and TypeScript",
    "url": "https://udemy.com/course/react-typescript"
  }' | jq '.'
```

---

## 🧪 Bulk Operations

### 9. Connect Multiple GitHub Users (Batch Test)

```bash
for username in torvalds gvanrossum brynmawr dhh; do
  echo "Processing $username..."
  curl -X POST "http://localhost:3001/api/github/$username" \
    -H "Content-Type: application/json" \
    -d '{"userId": '$RANDOM'}' \
    -s | jq '.skillsDetected' | head -10
  echo "---"
done
```

---

### 10. Create Multiple Activities for User 1

```bash
ACTIVITIES=(
  '{"userId":1,"type":"event","source":"luma","title":"Vue.js Mastery Workshop","url":"https://luma.com/vue"}'
  '{"userId":1,"type":"event","source":"luma","title":"GraphQL Advanced Patterns","url":"https://luma.com/graphql"}'
  '{"userId":1,"type":"event","source":"luma","title":"Docker & Kubernetes Deep Dive","url":"https://luma.com/k8s"}'
  '{"userId":1,"type":"event","source":"meetup","title":"Machine Learning Fundamentals","url":"https://meetup.com/ml"}'
)

for activity in "${ACTIVITIES[@]}"; do
  curl -X POST http://localhost:3001/api/activities \
    -H "Content-Type: application/json" \
    -d "$activity" \
    -s | jq '.skills'
done
```

---

## 📈 Analytics & Reporting

### 11. Get Comprehensive User Profile

```bash
curl http://localhost:3001/api/profile/1 | jq '{
  userId: .userId,
  totalSkills: (.skills | length),
  skills: .skills,
  totalActivities: (.activities | length),
  activities: .activities[]
}'
```

---

### 12. Compare Skills Between Users

```bash
echo "User 1 Skills:"
curl -s http://localhost:3001/api/profile/1 | jq '.skills | sort'

echo ""
echo "User 2 Skills:"
curl -s http://localhost:3001/api/profile/2 | jq '.skills | sort'

echo ""
echo "Common Skills:"
curl -s http://localhost:3001/api/profile/1 | jq '.skills[] as $s | select("$s" | IN(*(curl -s http://localhost:3001/api/profile/2 | jq '.skills[]')))'
```

---

## 🔍 Error Handling Examples

### 13. Test Non-Existent GitHub User

```bash
curl -X POST http://localhost:3001/api/github/thisshouldnotexistxyz123456 \
  -H "Content-Type: application/json" \
  -d '{"userId": 99}' | jq '.'
```

**Expected error:**
```json
{
  "success": false,
  "error": "GitHub user \"thisshouldnotexistxyz123456\" not found"
}
```

---

### 14. Test with Missing Required Fields

```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "title": "Some Event"
  }' | jq '.'
```

---

## 🔧 Useful Combinations

### 15. Full User Profile Generation (GitHub + Manual Activities)

```bash
#!/bin/bash

USERNAME="torvalds"
USER_ID=100

# Step 1: Connect GitHub
echo "1. Connecting GitHub..."
curl -s -X POST "http://localhost:3001/api/github/$USERNAME" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID}" | jq '.skillsDetected'

# Step 2: Add manual event
echo ""
echo "2. Adding manual event..."
curl -s -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID, \"type\": \"event\", \"source\": \"luma\", \"title\": \"Advanced C Programming\", \"url\": \"https://example.com\"}" | jq '.skills'

# Step 3: Get complete profile
echo ""
echo "3. Complete profile:"
curl -s "http://localhost:3001/api/profile/$USER_ID" | jq '{
  totalSkills: (.skills | length),
  skills: .skills | sort,
  totalActivities: (.activities | length)
}'
```

---

## 💡 Tips

### Using jq for Pretty Output
All examples use `jq '.'` for pretty JSON formatting. If `jq` is not installed:

```bash
# Install jq (macOS)
brew install jq

# Install jq (Ubuntu/Debian)
sudo apt-get install jq
```

Or remove `| jq '.'` to see raw JSON.

### Save Responses to Files

```bash
curl -X POST http://localhost:3001/api/github/torvalds \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' > github_response.json
```

### Test with Postman

Import this collection URL (coming soon) or manually create requests with:
- **Method:** POST (for GitHub) or GET (for profile)
- **URL:** `http://localhost:3001/api/github/username` or `http://localhost:3001/api/profile/:userId`
- **Headers:** `Content-Type: application/json`
- **Body:** JSON data shown in examples

---

## 🚀 Performance Notes

- GitHub API (without token): 60 requests/hour
- GitHub API (with token): 5,000 requests/hour
- Processing time per user: ~500ms-1s (depends on repo count)
- Recommend rate limiting in production

---

## 📚 Related Files

- `GITHUB_SETUP.md` — Setup instructions
- `IMPLEMENTATION_SUMMARY.md` — Technical details
- `README.md` — General project info
- `test-github-integration.sh` — Automated test script
