# GitHub Integration Setup Guide

## 🔐 Step 1: Create GitHub Personal Access Token

1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Set these options:
   - **Token name:** TraceCV
   - **Scopes:** Select `public_repo` and `read:user`
   - **Expiration:** Choose your preference (90 days is good for testing)
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)

## 📝 Step 2: Configure Environment Variables

```bash
# Navigate to API directory
cd apps/api

# Copy example file
cp .env.example .env

# Edit .env with your token
# On macOS/Linux:
nano .env

# Or use VS Code:
code .env
```

Add your GitHub token:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_API_BASE_URL=https://api.github.com
PORT=3001
NODE_ENV=development
```

## 🚀 Step 3: Install & Run

```bash
# From project root
cd /Users/adrian/Proyectos/tracecv

# Install dependencies
pnpm install

# Start the API server
cd apps/api
pnpm dev
```

Server will be running on `http://localhost:3001`

## ✨ Step 4: Test the GitHub Integration

### Connect a GitHub user:

```bash
curl -X POST http://localhost:3001/api/github/torvalds \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### Get the user's profile with extracted skills:

```bash
curl http://localhost:3001/api/profile/1
```

## 📊 What Gets Extracted

When you connect a GitHub profile, TraceCV extracts:

- **Languages:** All programming languages used in public repos
- **Topics:** Repository topics (machine-learning, web3, docker, etc.)
- **Technologies:** Tech keywords from repository descriptions
- **Expertise:** Repositories with 100+ stars flag "Open Source Contributor"

### Example Response:

```json
{
  "success": true,
  "skillsDetected": [
    "JavaScript",
    "Python",
    "React",
    "Machine Learning",
    "API Development",
    "Docker",
    "Open Source Contributor"
  ],
  "repositoriesProcessed": 20,
  "languages": ["JavaScript", "Python", "TypeScript"],
  "topics": ["machine-learning", "api", "rest"]
}
```

## 🔗 Supported Skills Detection

| Category | Examples |
|----------|----------|
| **Languages** | JavaScript, Python, Go, Rust, Java, C++, TypeScript, Ruby, PHP |
| **Frameworks** | React, Vue, Angular, Django, Flask, Express, FastAPI |
| **Cloud/DevOps** | AWS, GCP, Azure, Docker, Kubernetes |
| **Databases** | MongoDB, PostgreSQL, MySQL, Redis |
| **Specializations** | Machine Learning, Blockchain, Web3, API Development |

## 🐛 Troubleshooting

**"GitHub user not found"**
- Check the username spelling
- Make sure it's a public GitHub user

**"Rate limit exceeded"**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour
- Wait an hour or upgrade your GitHub plan

**"GITHUB_TOKEN not recognized"**
- Make sure `.env` file exists in `apps/api/`
- Restart the server after adding the token
- Check for typos in the token

## 🔒 Security Notes

- **Never commit `.env`** to git (it's in `.gitignore`)
- Keep your GitHub token private
- Tokens with `public_repo` scope can only access public data
- Consider using fine-grained personal access tokens (beta)

## 📚 Next Steps

- Connect multiple GitHub users
- Combine GitHub data with other sources (Luma events, etc.)
- Export profiles with detected skills
- Integrate with blockchain verification (Stellar)
