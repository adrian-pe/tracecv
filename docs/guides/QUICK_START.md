# 🚀 Quick Start Guide - GitHub Integration

## ⏱️ 5-Minute Setup

### 1. **Install Dependencies** (1 min)
```bash
cd /Users/adrian/Proyectos/tracecv
pnpm install
```

### 2. **Set Up Environment** (2 min)
```bash
cd apps/api
cp .env.example .env

# Edit .env if you want to add GitHub token (optional)
# nano .env
```

### 3. **Start the Server** (1 min)
```bash
pnpm dev
```

You should see:
```
Server running on http://localhost:3001
```

### 4. **Test It** (1 min)
```bash
# In another terminal:
curl -X POST http://localhost:3001/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

---

## 📍 What Just Happened?

The system:
1. ✅ Fetched GitHub profile for `octocat`
2. ✅ Retrieved all public repositories
3. ✅ Extracted programming languages used
4. ✅ Analyzed repository topics
5. ✅ Automatically detected skills (React, JavaScript, etc.)
6. ✅ Stored activities and skills in database

---

## 🎯 Next Steps

### Get the User's Profile
```bash
curl http://localhost:3001/api/profile/1
```

You'll see:
- All extracted skills
- All activities (repos)
- Complete user profile

### Try Another User
```bash
curl -X POST http://localhost:3001/api/github/torvalds \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# View their profile
curl http://localhost:3001/api/profile/2
```

### Add Manual Activities
```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "event",
    "source": "luma",
    "title": "Vue.js Workshop",
    "url": "https://example.com"
  }'
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `GITHUB_SETUP.md` | Detailed GitHub setup |
| `IMPLEMENTATION_SUMMARY.md` | Technical architecture |
| `API_EXAMPLES.md` | 15+ ready-to-use examples |
| `test-github-integration.sh` | Automated testing |

---

## 🔐 (Optional) Set Up GitHub Token for Higher Rate Limits

1. **Create token:** https://github.com/settings/tokens
   - Select: `public_repo`, `read:user`
   - Copy token

2. **Add to .env:**
   ```bash
   # In apps/api/.env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Restart server**
   ```bash
   # Ctrl+C to stop
   # Then restart:
   pnpm dev
   ```

---

## ✨ Key Features

✅ **GitHub Integration**
- Fetch user profile
- Get all public repositories
- Extract languages, topics, descriptions

✅ **Smart Skill Detection**
- 30+ programming languages
- 25+ frameworks & technologies
- Badge system (Open Source Contributor)
- Keyword analysis from descriptions

✅ **Profile Aggregation**
- Combine GitHub data + manual activities
- Unified skill profile
- Complete activity history

✅ **Easy Testing**
- No GitHub token needed to start
- Public data access
- cURL-based testing

---

## 🐛 Troubleshooting

**Server won't start?**
```bash
# Make sure dependencies are installed
pnpm install

# Check port 3001 is not in use
lsof -i :3001
```

**GitHub user not found?**
```bash
# Make sure username is correct and spelled right
# User must be public on GitHub
curl -X POST http://localhost:3001/api/github/validusername \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Want to see all available commands?**
```bash
cat API_EXAMPLES.md
```

---

## 📊 What's Next?

- [ ] Set up persistent database (SQLite, MongoDB)
- [ ] Create web frontend (Next.js)
- [ ] Add Luma API integration
- [ ] Implement blockchain verification
- [ ] Add skill endorsements
- [ ] Export profiles (PDF, JSON)

---

## 💬 Need Help?

Check these files:
1. `GITHUB_SETUP.md` — Step-by-step setup
2. `API_EXAMPLES.md` — Ready-to-use examples
3. `README.md` — General documentation

---

## 🎉 Success!

Your TraceCV GitHub integration is now **fully operational**. You can:

- ✅ Connect GitHub profiles
- ✅ Extract skills automatically
- ✅ Aggregate user activities
- ✅ Build dynamic professional profiles

Happy coding! 🚀
