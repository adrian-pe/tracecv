# Project Structure Guide

This document explains the TraceCV project structure and how to navigate it.

## 📁 Top-Level Structure

```
tracecv/
├── backend/              # Backend Express.js API
├── frontend/             # Frontend Next.js application
├── docs/                 # Complete documentation
├── package.json          # Root package (monorepo)
├── pnpm-workspace.yaml   # Monorepo workspace config
└── README.md            # Project README
```

---

## 🔧 Backend (`/backend`)

Express.js API server for TraceCV.

### Structure
```
backend/
├── src/
│   ├── index.js            # Server entry point
│   ├── routes.js           # API routes & endpoints
│   ├── skillEngine.js      # Skill extraction logic
│   ├── githubService.js    # GitHub API integration
│   └── db.js               # In-memory database
├── package.json            # Backend dependencies
├── .env.example            # Environment template
└── README.md              # Backend documentation
```

### Key Files
- **`src/index.js`** — Starts Express server on port 3001
- **`src/routes.js`** — Defines API endpoints (/api/activities, /api/github, /api/profile)
- **`src/skillEngine.js`** — Extracts skills from activities
- **`src/githubService.js`** — Fetches and processes GitHub data

### Running Backend
```bash
cd backend
pnpm install
cp .env.example .env
pnpm dev
```

Server runs at: `http://localhost:3001`

---

## 🎨 Frontend (`/frontend`)

Next.js web application (currently in planning).

### Structure
```
frontend/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utility functions
├── public/             # Static files
├── styles/             # CSS/Tailwind styles
├── package.json        # Frontend dependencies
└── README.md          # Frontend documentation
```

### Key Directories
- **`app/`** — Next.js 13+ App Router pages
- **`components/`** — Reusable React components
- **`lib/`** — Helper functions and utilities
- **`public/`** — Static files (images, fonts, etc.)
- **`styles/`** — Global and component styles

### Running Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

Server runs at: `http://localhost:3000`

---

## 📚 Documentation (`/docs`)

Complete project documentation organized by category.

### Structure
```
docs/
├── guides/                      # Step-by-step guides
│   ├── QUICK_START.md          # 5-minute setup
│   └── GITHUB_SETUP.md         # GitHub integration setup
│
├── architecture/               # Technical documentation
│   ├── ARCHITECTURE.md         # System design & diagrams
│   ├── IMPLEMENTATION_SUMMARY.md # Technical overview
│   └── GITHUB_INTEGRATION_COMPLETE.md # Complete overview
│
├── examples/                   # Code examples
│   └── API_EXAMPLES.md         # 15+ API examples
│
├── DOCUMENTATION_INDEX.md      # This file
├── EXECUTIVE_SUMMARY.md        # Executive overview
└── COMPLETION_CHECKLIST.md     # Implementation status
```

### Documentation by Purpose

#### Getting Started
1. **[QUICK_START.md](./guides/QUICK_START.md)** ⭐
   - 5-minute setup
   - First test
   - Troubleshooting

2. **[GITHUB_SETUP.md](./guides/GITHUB_SETUP.md)**
   - Detailed GitHub token setup
   - Environment configuration
   - API limits explained

#### Technical Deep Dive
1. **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)**
   - System architecture diagram
   - Data flow visualization
   - Module dependencies
   - Security architecture

2. **[IMPLEMENTATION_SUMMARY.md](./architecture/IMPLEMENTATION_SUMMARY.md)**
   - Completed features
   - Skill detection details
   - Files created/modified

3. **[GITHUB_INTEGRATION_COMPLETE.md](./architecture/GITHUB_INTEGRATION_COMPLETE.md)**
   - Implementation overview
   - Integration points
   - Metrics

#### Code & Examples
- **[API_EXAMPLES.md](./examples/API_EXAMPLES.md)** — 15+ ready-to-use curl examples

#### Overview & Status
- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** — High-level overview
- **[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)** — Project status

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/adrian-pe/tracecv.git
cd tracecv
pnpm install
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env to add GitHub token (optional)
```

### 3. Start Backend
```bash
pnpm dev
```

### 4. Test API
```bash
curl -X POST http://localhost:3001/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 5. (Optional) Start Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

---

## 📖 Reading Paths

### For Developers
1. [QUICK_START.md](./guides/QUICK_START.md) (5 min)
2. [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) (20 min)
3. [API_EXAMPLES.md](./examples/API_EXAMPLES.md) (15 min)
4. Start coding!

### For Project Managers
1. [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) (5 min)
2. [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) (5 min)

### For DevOps/Infrastructure
1. [QUICK_START.md](./guides/QUICK_START.md) (5 min)
2. [GITHUB_SETUP.md](./guides/GITHUB_SETUP.md) (15 min)
3. Backend README (5 min)

---

## 🔗 Key Files at a Glance

| File | Purpose | Location |
|------|---------|----------|
| Project README | Overview & links | `/README.md` |
| Backend README | Backend setup | `/backend/README.md` |
| Frontend README | Frontend setup | `/frontend/README.md` |
| Quick Start | 5-minute setup | `/docs/guides/QUICK_START.md` |
| API Examples | Code examples | `/docs/examples/API_EXAMPLES.md` |
| Architecture | System design | `/docs/architecture/ARCHITECTURE.md` |
| API Routes | Express routes | `/backend/src/routes.js` |
| Skill Engine | Logic | `/backend/src/skillEngine.js` |
| GitHub Service | GitHub API | `/backend/src/githubService.js` |

---

## 🎯 Common Tasks

### I want to...

**Start the API**
```bash
cd backend && pnpm dev
```

**Test the API**
```bash
curl -X POST http://localhost:3001/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**See API examples**
→ Read `/docs/examples/API_EXAMPLES.md`

**Set up GitHub token**
→ Follow `/docs/guides/GITHUB_SETUP.md`

**Understand the system**
→ Read `/docs/architecture/ARCHITECTURE.md`

**See project status**
→ Check `/docs/COMPLETION_CHECKLIST.md`

**Start frontend development**
```bash
cd frontend && pnpm dev
```

**Check documentation**
→ Visit `/docs/DOCUMENTATION_INDEX.md`

---

## 📊 Project Stats

| Aspect | Details |
|--------|---------|
| **Languages** | JavaScript, TypeScript (ready) |
| **Backend Framework** | Express.js |
| **Frontend Framework** | Next.js (upcoming) |
| **Database** | In-memory (upgrade to SQLite/MongoDB) |
| **Documentation** | 9+ documents |
| **API Endpoints** | 3+ endpoints |
| **Skills Detected** | 55+ (30 languages, 25 technologies) |
| **Setup Time** | 2 minutes |

---

## 🔐 Security

- ✅ GitHub token optional
- ✅ Environment variables protected
- ✅ No hardcoded secrets
- ✅ Input validation
- ✅ Public data only

---

## 📞 Quick Help

**Problem: Port already in use?**
→ Change port in backend `.env` or kill process on port 3001

**Problem: GitHub API error?**
→ See `/docs/guides/GITHUB_SETUP.md#troubleshooting`

**Problem: Module not found?**
→ Run `pnpm install` in the affected directory

**Question: How do I use endpoint X?**
→ Check `/docs/examples/API_EXAMPLES.md`

**Question: How does feature Y work?**
→ See `/docs/architecture/ARCHITECTURE.md`

---

## 📚 Complete File Index

### Root Files
- `/README.md` — Project overview
- `/package.json` — Root workspace config
- `/pnpm-workspace.yaml` — Monorepo configuration
- `/.gitignore` — Git exclusions
- `/test-github-integration.sh` — Test script

### Backend (`/backend`)
- `/backend/package.json` — Backend dependencies
- `/backend/.env.example` — Environment template
- `/backend/README.md` — Backend docs
- `/backend/src/index.js` — Server entry
- `/backend/src/routes.js` — API routes
- `/backend/src/skillEngine.js` — Skill logic
- `/backend/src/githubService.js` — GitHub API
- `/backend/src/db.js` — Database

### Frontend (`/frontend`)
- `/frontend/package.json` — Frontend dependencies
- `/frontend/README.md` — Frontend docs
- `/frontend/tsconfig.json` — TypeScript config
- `/frontend/.gitignore` — Exclusions
- `/frontend/app/` — Next.js pages
- `/frontend/components/` — React components
- `/frontend/lib/` — Utilities
- `/frontend/public/` — Static files
- `/frontend/styles/` — Styles

### Documentation (`/docs`)
- `/docs/guides/QUICK_START.md` — 5-min setup
- `/docs/guides/GITHUB_SETUP.md` — GitHub integration
- `/docs/architecture/ARCHITECTURE.md` — System design
- `/docs/architecture/IMPLEMENTATION_SUMMARY.md` — Tech details
- `/docs/architecture/GITHUB_INTEGRATION_COMPLETE.md` — Integration overview
- `/docs/examples/API_EXAMPLES.md` — Code examples
- `/docs/DOCUMENTATION_INDEX.md` — Doc navigation
- `/docs/EXECUTIVE_SUMMARY.md` — Executive summary
- `/docs/COMPLETION_CHECKLIST.md` — Status

---

**Last Updated:** May 8, 2026
**Status:** ✅ Structure Complete
