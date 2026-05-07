# TraceCV 🚀

**TraceCV** is a proof-of-skills engine that transforms real user activity into a verifiable professional profile.

Instead of relying on self-reported CVs, TraceCV builds a **dynamic, evidence-based identity** using:

- Events attended (e.g. Luma)
- Code contributions (e.g. GitHub)
- Real-world technical activity

---

## 🧠 Vision

Traditional resumes are:
- Static  
- Subjective  
- Easy to fake  

TraceCV introduces a new model:

> **Professional identity based on verifiable activity**

In the future, this will be strengthened using blockchain verification via Stellar.

---

## ⚙️ How it works
Event / Repo → Activity → Skill → Profile


1. User performs real activity (event, coding, contribution)  
2. Activity is captured (via extension or API)  
3. System extracts skills automatically  
4. Profile is generated dynamically  

---

## 🏗️ Monorepo Structure
apps/
api/ # Backend (Express)
web/ # Frontend (Next.js - upcoming)
extension/ # Browser extension (upcoming)

packages/
core/ # Shared logic (skill engine, parsers)

---

## 🚀 Current MVP

### ✅ Backend API (working)

- `POST /api/activities`  
  Ingests user activities (events, repositories, etc.)

- `GET /api/profile/:userId`  
  Returns aggregated profile:
  - skills
  - activities

---

## 🧪 Example Usage

### ➤ Create Activity
POST /api/activities
```json
{
  "userId": 1,
  "type": "event",
  "source": "luma",
  "title": "Web3 Solidity Workshop",
  "url": "https://example.com"
}

➤ Get Profile
GET /api/profile/1
Response:
```json
{
  "userId": 1,
  "skills": ["Blockchain"],
  "activities": [
    {
      "id": 1710000000000,
      "type": "event",
      "source": "luma",
      "title": "Web3 Solidity Workshop"
    }
  ]
}

🧩 Features
Activity ingestion (events, repos)
Basic skill extraction engine
Profile aggregation
Lightweight architecture for rapid iteration
🧠 Skill Engine (MVP)

TraceCV uses a rule-based system (for now):

Detects keywords from events (e.g. "Solidity" → Blockchain)
Infers skills from sources (e.g. GitHub → Programming)

Future versions will include:

skill scoring
weighting by activity type
AI-assisted classification
🛠️ Tech Stack
Node.js
Express
pnpm (monorepo)
JavaScript (MVP)
⚙️ Run Locally
cd apps/api
pnpm install
pnpm dev

Server runs at:
http://localhost:3001