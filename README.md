# TraceCV

> **Professional identity based on verifiable activity, not self-reported claims.**

TraceCV is a proof-of-skills engine that transforms real-world technical activity into a verifiable, dynamic professional profile. Instead of relying on static, self-reported CVs, TraceCV extracts and aggregates skills from tangible evidence: events attended, code contributions, and real-world technical participation.

## 📁 Project Structure

```
tracecv/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── routes.js       # API routes
│   │   ├── skillEngine.js  # Skill extraction logic
│   │   ├── githubService.js # GitHub API integration
│   │   └── db.js           # Database (in-memory)
│   ├── package.json
│   └── .env.example        # Configuration template
│
├── frontend/               # Next.js web application (upcoming)
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
│
├── docs/                   # Complete documentation
│   ├── guides/            # Setup & usage guides
│   │   ├── QUICK_START.md
│   │   └── GITHUB_SETUP.md
│   ├── architecture/      # Technical documentation
│   │   ├── ARCHITECTURE.md
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   └── GITHUB_INTEGRATION_COMPLETE.md
│   ├── examples/          # Code examples
│   │   └── API_EXAMPLES.md
│   ├── DOCUMENTATION_INDEX.md
│   ├── EXECUTIVE_SUMMARY.md
│   └── COMPLETION_CHECKLIST.md
│
├── package.json            # Root package.json (monorepo)
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10+

### Installation & Running

```bash
# Install dependencies
pnpm install

# Start backend API
cd backend
cp .env.example .env
pnpm dev
```

Server will be available at `http://localhost:3001`

## 📚 Documentation

Complete documentation is available in the `docs/` directory:

- **[Getting Started](./docs/guides/QUICK_START.md)** — 5-minute setup guide
- **[GitHub Setup](./docs/guides/GITHUB_SETUP.md)** — Detailed GitHub integration setup
- **[Architecture](./docs/architecture/ARCHITECTURE.md)** — System design & diagrams
- **[API Examples](./docs/examples/API_EXAMPLES.md)** — 15+ ready-to-use examples
- **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)** — Complete doc navigation

## 🎯 Vision

Traditional resumes suffer from fundamental limitations:
- **Static** — Updated infrequently
- **Subjective** — Self-assessed capabilities
- **Unreliable** — Easy to overstate or fabricate

TraceCV addresses these issues by building **evidence-based professional profiles** that reflect actual activity and verified contributions. In the future, profiles will leverage blockchain verification via Stellar for immutable credentialing.

## ⚙️ How It Works

```
Real Activity → Data Ingestion → Skill Extraction → Dynamic Profile
```

The system operates through a simple pipeline:

1. **User performs real activity** — Attends events, contributes to code, participates in technical projects
2. **Activity is captured** — Via API integrations, browser extensions, or direct submission
3. **Skills are extracted automatically** — Machine learning-based skill engine analyzes activity content
4. **Profile is generated dynamically** — Skills and activities are aggregated into a verifiable profile

## ✨ Core Features

- ✅ **GitHub Integration** — Automatic skill detection from GitHub repositories
- ✅ **Activity Ingestion** — Capture events, repositories, and technical contributions
- ✅ **Skill Extraction** — Intelligent parsing to identify relevant skills (30+ languages, 25+ technologies)
- ✅ **Profile Aggregation** — Unified view of user activities and inferred capabilities
- ✅ **Lightweight Architecture** — Optimized for rapid iteration and scalability

## 🔌 API Endpoints

### GitHub Integration
```http
POST /api/github/:username
```
Connect a GitHub profile and automatically extract skills from repositories.

### Activities
```http
POST /api/activities
GET /api/profile/:userId
```
Create manual activities and retrieve user profiles.

See [API Examples](./docs/examples/API_EXAMPLES.md) for detailed examples.

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **HTTP Client:** Axios
- **Environment:** dotenv
- **Process Management:** Nodemon

### Frontend (Upcoming)
- **Framework:** Next.js
- **Styling:** TBD
- **State Management:** TBD

## 📊 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend API** | ✅ Complete | Express.js with GitHub integration |
| **GitHub Integration** | ✅ Complete | Full skill extraction implemented |
| **Frontend** | 🔄 Upcoming | Next.js web application |
| **Database** | ⚠️ In-Memory | Consider SQLite/MongoDB for production |
| **Blockchain** | 📋 Planned | Stellar integration |
| **Browser Extension** | 📋 Planned | Activity capture extension |

## 📈 Skill Detection

TraceCV automatically detects skills from GitHub data:

### Programming Languages (30+)
JavaScript, Python, Go, Rust, Java, C++, TypeScript, Ruby, PHP, Swift, Kotlin, etc.

### Frameworks & Technologies (25+)
React, Vue, Angular, Node.js, Django, Flask, Docker, Kubernetes, AWS, GCP, Azure, etc.

### Specializations
Machine Learning, Blockchain, Web3, API Development, Database Design, DevOps, etc.

## 🔐 Security

- ✅ GitHub token is optional
- ✅ Environment variables protected (`.env` in `.gitignore`)
- ✅ No hardcoded secrets
- ✅ Input validation
- ✅ Only reads public GitHub data

## 🧪 Testing

Run the test script to verify the integration:

```bash
chmod +x test-github-integration.sh
./test-github-integration.sh
```

Or test manually with cURL:

```bash
curl -X POST http://localhost:3001/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

## 📦 Dependencies

### Production
- **express** (^5.2.1) — Web framework
- **axios** (^1.6.5) — HTTP client
- **cors** (^2.8.6) — CORS middleware
- **dotenv** (^16.3.1) — Environment configuration

### Development
- **nodemon** (^3.1.14) — Auto-reload server

## 🚀 Roadmap

- [ ] Frontend application (Next.js)
- [ ] Persistent database (SQLite/MongoDB)
- [ ] Luma API integration (events)
- [ ] Advanced skill inference algorithms
- [ ] Stellar blockchain verification
- [ ] Public profile URLs
- [ ] Skill endorsements
- [ ] Export capabilities (PDF, JSON)
- [ ] Browser extension for activity capture
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please ensure code follows the existing patterns and includes appropriate documentation.

## 📄 License

ISC

## 📞 Support

For questions or issues:
- Check the [documentation](./docs/DOCUMENTATION_INDEX.md)
- Read [Getting Started](./docs/guides/QUICK_START.md)
- See [Troubleshooting](./docs/guides/GITHUB_SETUP.md#troubleshooting)
- Open a [GitHub Issue](https://github.com/adrian-pe/tracecv/issues)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10+

### Installation

```bash
# Install dependencies across the monorepo
pnpm install

# Start the API in development mode
cd apps/api
pnpm dev
```

The API will be available at `http://localhost:3001`

## API Reference

### Endpoints

#### Create Activity
```http
POST /api/activities
Content-Type: application/json

{
  "userId": 1,
  "type": "event",
  "source": "luma",
  "title": "Web3 Solidity Workshop",
  "url": "https://example.com"
}
```

#### Get User Profile
```http
GET /api/profile/1
```

**Response:**
```json
{
  "userId": 1,
  "skills": ["Blockchain", "Solidity"],
  "activities": [
    {
      "id": 1710000000000,
      "type": "event",
      "source": "luma",
      "title": "Web3 Solidity Workshop",
      "url": "https://example.com"
    }
  ]
}
```

#### Connect GitHub Profile
```http
POST /api/github/username
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "GitHub profile for \"username\" processed successfully",
  "user": {
    "username": "username",
    "profile": {
      "name": "Full Name",
      "bio": "Developer bio",
      "location": "City, Country",
      "public_repos": 42,
      "followers": 100,
      "following": 50,
      "created_at": "2018-03-15T00:00:00Z",
      "avatar_url": "https://avatars.githubusercontent.com/..."
    }
  },
  "skillsDetected": ["JavaScript", "Python", "React", "Machine Learning"],
  "repositoriesProcessed": 20,
  "totalRepositories": 42,
  "languages": ["JavaScript", "Python", "HTML"],
  "topics": ["machine-learning", "web3", "api"]
}
```

## GitHub Integration

### Setup

1. **Create a GitHub Personal Access Token**
   - Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `public_repo`, `read:user`
   - Copy the token

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   - Edit `apps/api/.env` and add your GitHub token:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token_here
   GITHUB_API_BASE_URL=https://api.github.com
   PORT=3001
   NODE_ENV=development
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

### Usage

Connect a user's GitHub profile to their TraceCV account:

```bash
curl -X POST http://localhost:3001/api/github/torvalds \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

The system will:
- Fetch all public repositories
- Extract programming languages used
- Analyze repository topics and descriptions
- Generate skills based on:
  - **Languages:** JavaScript, Python, Rust, etc.
  - **Technologies:** React, Django, Docker, Kubernetes, etc.
  - **Expertise levels:** Repositories with 100+ stars indicate mastery
  - **Topics:** Web3, Machine Learning, APIs, etc.

### Skill Detection from GitHub

TraceCV analyzes GitHub profiles to automatically detect skills:

| Source | Examples |
|--------|----------|
| **Languages** | JavaScript, Python, Go, Rust, TypeScript |
| **Topics** | machine-learning, blockchain, web3, docker |
| **Descriptions** | Parsing for tech keywords (API, database, etc.) |
| **Stars** | 100+ stars → "Open Source Contributor" |

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **HTTP Client:** Axios
- **Environment:** dotenv
- **Process Management:** Nodemon
- **CORS:** Built-in support

### Dependencies
- **axios** — HTTP client for GitHub API integration
- **cors** — Cross-Origin Resource Sharing middleware
- **dotenv** — Environment variable configuration
- **express** — Web framework
- **nodemon** — Auto-reload development server

### Current Status
- API: ✅ MVP Complete
- GitHub Integration: ✅ Complete
- Web UI: 🔄 In Development
- Browser Extension: 📋 Planned
- Blockchain Integration: 📋 Planned

## Skill Engine

The skill extraction engine analyzes:
- **Event metadata** — Title, description, tags
- **Repository information** — Languages, technologies, frameworks
- **User activity patterns** — Frequency and consistency of contributions
- **GitHub data** — Programming languages, topics, stars, descriptions

Future enhancements will include machine learning models for improved accuracy.

## Development

### Available Commands

```bash
# Start development server with hot reload
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Roadmap

- [ ] Frontend application (Next.js)
- [ ] GitHub API integration
- [ ] Luma API integration
- [ ] Advanced skill inference algorithms
- [ ] Stellar blockchain verification
- [ ] Public profile URLs
- [ ] Export capabilities (PDF, JSON)

## Architecture Decisions

- **Monorepo Structure:** Enables code sharing and coordinated releases
- **Express.js:** Lightweight and flexible for rapid prototyping
- **pnpm:** Efficient dependency management and workspace support
- **Modular Design:** Services can evolve independently

## Contributing

Contributions are welcome. Please ensure code follows the existing patterns and includes appropriate documentation.

## License

ISC

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.

TraceCV uses a rule-based system (for now):

- Detects keywords from events (e.g. "Solidity" → Blockchain)
- Infers skills from sources (e.g. GitHub → Programming)

Future versions will include:

- Skill scoring
- Weighting by activity type
- AI-assisted classification

### Tech Stack
- Node.js
- Express
- pnpm (monorepo)
- JavaScript (MVP)

### Run Locally

```bash
cd apps/api
pnpm install
pnpm dev
```

Server runs at: `http://localhost:3001`