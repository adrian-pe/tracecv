# TraceCV

> **Professional identity based on verifiable activity, not self-reported claims.**

TraceCV is a proof-of-skills engine that transforms real-world technical activity into a verifiable, dynamic professional profile. Instead of relying on static, self-reported CVs, TraceCV extracts and aggregates skills from tangible evidence: events attended, code contributions, and real-world technical participation.

## Vision

Traditional resumes suffer from fundamental limitations:
- **Static** — Updated infrequently
- **Subjective** — Self-assessed capabilities
- **Unreliable** — Easy to overstate or fabricate

TraceCV addresses these issues by building **evidence-based professional profiles** that reflect actual activity and verified contributions. In the future, profiles will leverage blockchain verification via Stellar for immutable credentialing.

## How It Works

```
Real Activity → Data Ingestion → Skill Extraction → Dynamic Profile
```

The system operates through a simple pipeline:

1. **User performs real activity** — Attends events, contributes to code, participates in technical projects
2. **Activity is captured** — Via API integrations, browser extensions, or direct submission
3. **Skills are extracted automatically** — Machine learning-based skill engine analyzes activity content
4. **Profile is generated dynamically** — Skills and activities are aggregated into a verifiable profile

## Project Structure

```
tracecv/
├── apps/
│   ├── api/          # Express.js backend API
│   ├── web/          # Next.js frontend (upcoming)
│   └── extension/    # Browser extension (planned)
├── packages/
│   └── core/         # Shared logic & skill engine
└── package.json      # Monorepo configuration
```

This is a **monorepo** managed with pnpm, allowing shared utilities and independent deployment of services.

## Core Features

- ✅ **Activity Ingestion** — Capture events, repositories, and technical contributions
- ✅ **Skill Extraction** — Intelligent parsing to identify relevant skills
- ✅ **Profile Aggregation** — Unified view of user activities and inferred capabilities
- ✅ **Lightweight Architecture** — Optimized for rapid iteration and scalability

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

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Process Management:** Nodemon
- **CORS:** Built-in support

### Current Status
- API: ✅ MVP Complete
- Web UI: 🔄 In Development
- Browser Extension: 📋 Planned
- Blockchain Integration: 📋 Planned

## Skill Engine

The skill extraction engine analyzes:
- **Event metadata** — Title, description, tags
- **Repository information** — Languages, technologies, frameworks
- **User activity patterns** — Frequency and consistency of contributions

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