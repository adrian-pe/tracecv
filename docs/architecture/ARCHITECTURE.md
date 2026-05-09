# TraceCV Architecture - GitHub Integration

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  curl / Postman / Frontend                                      │
│       │              │           │                              │
│       ├─────────────┼───────────┤                               │
│       ↓              ↓           ↓                               │
│  GitHub Profile  Activities  Profile Query                     │
│  Connection      Creation    Retrieval                         │
│                                                                  │
└────────────────────┬──────────────────────┬──────────────────┘
                     │                      │
        ┌────────────↓────────────────────↓─────────────┐
        │                                                 │
        ↓                                                 ↓
   ┌─────────────────────────────┐      ┌──────────────────────┐
   │      API LAYER              │      │   API LAYER          │
   │   (Express.js)              │      │   (Express.js)       │
   ├─────────────────────────────┤      ├──────────────────────┤
   │ POST /api/github/:username  │      │ GET /api/profile/:id │
   │ POST /api/activities        │      │                      │
   │                             │      │                      │
   └────────────┬────────────────┘      └──────────┬───────────┘
                │                                   │
                ↓                                   │
        ┌───────────────────────────────────┐      │
        │   SERVICE LAYER                   │      │
        ├───────────────────────────────────┤      │
        │                                   │      │
        │  githubService.js                │      │
        │  ├─ fetchUserProfile()           │      │
        │  ├─ fetchUserRepositories()      │      │
        │  └─ enrichGitHubData()           │      │
        │                                   │      │
        └────────────┬──────────────────────┘      │
                     │                              │
                     ↓                              │
        ┌──────────────────────────────────┐       │
        │    BUSINESS LOGIC LAYER          │       │
        ├──────────────────────────────────┤       │
        │                                   │       │
        │   skillEngine.js                 │       │
        │   ├─ extractSkills()             │       │
        │   └─ extractSkillsFromGitHub()   │       │
        │       ├─ Analyze languages      │       │
        │       ├─ Parse topics           │       │
        │       ├─ Read descriptions      │       │
        │       └─ Score expertise        │       │
        │                                   │       │
        └────────────┬─────────────────────┘       │
                     │                              │
                     ↓                              │
        ┌──────────────────────────────────┐       │
        │    DATA LAYER (In-Memory)        │       │
        ├──────────────────────────────────┤       │
        │                                   │       │
        │   db.js                          │       │
        │   ├─ users: []                   │       │
        │   ├─ activities: []              │       │
        │   ├─ skills: []                  │       │
        │   └─ userSkills: []              │       │
        │                                   │       │
        └────────────┬─────────────────────┘       │
                     │                              │
                     ├──────────────────────────────┘
                     │
                     ↓
        ┌──────────────────────────────────┐
        │  EXTERNAL SERVICES               │
        ├──────────────────────────────────┤
        │                                   │
        │  GitHub API v3                   │
        │  └─ https://api.github.com       │
        │     ├─ User profiles             │
        │     ├─ Repositories              │
        │     ├─ Languages                 │
        │     └─ Topics                    │
        │                                   │
        └──────────────────────────────────┘
```

---

## Request/Response Flow

### **Flow 1: GitHub Profile Connection**

```
1. Client Request
   ┌─────────────────────────────────────┐
   │ POST /api/github/torvalds           │
   │ {                                    │
   │   "userId": 1                        │
   │ }                                    │
   └────────────┬────────────────────────┘
                │
                ↓
2. Route Handler (routes.js)
   ┌─────────────────────────────────────┐
   │ Validate input                      │
   │ Extract params: username, userId    │
   └────────────┬────────────────────────┘
                │
                ↓
3. GitHub Service (githubService.js)
   ┌─────────────────────────────────────┐
   │ enrichGitHubData(username, userId)  │
   │ ├─ fetchUserProfile()               │
   │ │  └─ GET /users/:username          │
   │ ├─ fetchUserRepositories()          │
   │ │  └─ GET /users/:username/repos    │
   │ └─ Extract languages & topics       │
   └────────────┬────────────────────────┘
                │
                ↓
4. GitHub API Response
   ┌─────────────────────────────────────┐
   │ {                                    │
   │   profile: {...},                   │
   │   repositories: [...],              │
   │   languages: ["Python", "Go", ...], │
   │   topics: ["linux", "kernel", ...]  │
   │ }                                    │
   └────────────┬────────────────────────┘
                │
                ↓
5. Skill Engine (skillEngine.js)
   ┌─────────────────────────────────────┐
   │ extractSkillsFromGitHub(             │
   │   languages,                         │
   │   topics,                            │
   │   repositories                       │
   │ )                                    │
   │                                      │
   │ Output: [                            │
   │   "Python",                          │
   │   "Go",                              │
   │   "Systems Programming",             │
   │   "Linux",                           │
   │   "Open Source Contributor"          │
   │ ]                                    │
   └────────────┬────────────────────────┘
                │
                ↓
6. Store in Database (db.js)
   ┌─────────────────────────────────────┐
   │ For each repo:                       │
   │ ├─ Add to db.activities[]           │
   │ │  {id, userId, title, url, ...}    │
   │ │                                    │
   │ For each skill:                     │
   │ ├─ Add to db.userSkills[]           │
   │ │  {userId, skill, source}          │
   └────────────┬────────────────────────┘
                │
                ↓
7. Return Response
   ┌──────────────────────────────────────┐
   │ {                                     │
   │   "success": true,                    │
   │   "message": "GitHub profile...",     │
   │   "skillsDetected": [                 │
   │     "Python",                         │
   │     "Go",                             │
   │     "Systems Programming",            │
   │     "Open Source Contributor"         │
   │   ],                                  │
   │   "repositoriesProcessed": 20,        │
   │   "languages": ["Python", "Go"],      │
   │   "topics": ["linux", "kernel"]       │
   │ }                                     │
   └──────────────────────────────────────┘
```

---

### **Flow 2: Get User Profile**

```
1. Client Request
   ┌──────────────────────────────┐
   │ GET /api/profile/1           │
   └──────────┬───────────────────┘
              │
              ↓
2. Route Handler (routes.js)
   ┌──────────────────────────────┐
   │ userId = 1                   │
   └──────────┬───────────────────┘
              │
              ↓
3. Query Database (db.js)
   ┌──────────────────────────────────────┐
   │ activities = db.activities            │
   │   .filter(a => a.userId === 1)       │
   │                                       │
   │ userSkills = db.userSkills            │
   │   .filter(s => s.userId === 1)       │
   │   .map(s => s.skill)                 │
   │                                       │
   │ uniqueSkills = [...new Set(skills)]  │
   └──────────┬───────────────────────────┘
              │
              ↓
4. Return Profile
   ┌────────────────────────────────────────┐
   │ {                                       │
   │   "userId": 1,                          │
   │   "skills": [                           │
   │     "Python",                           │
   │     "Go",                               │
   │     "JavaScript",                       │
   │     "Systems Programming",              │
   │     "Open Source Contributor"           │
   │   ],                                    │
   │   "activities": [                       │
   │     {                                   │
   │       "id": "github-12345",             │
   │       "userId": 1,                      │
   │       "type": "repository",             │
   │       "source": "github",               │
   │       "title": "linux",                 │
   │       "url": "https://github.com/...",  │
   │       "language": "C",                  │
   │       "stars": 165000,                  │
   │       "updatedAt": "2024-05-08T..."     │
   │     },                                  │
   │     ...more repos...                    │
   │   ]                                     │
   │ }                                       │
   └────────────────────────────────────────┘
```

---

## Data Models

### **User Activity**
```javascript
{
  id: "github-12345",           // Unique identifier
  userId: 1,                    // User reference
  type: "repository",           // Type: event, course, repository
  source: "github",             // Source: luma, udemy, github, etc.
  title: "linux",               // Activity title
  url: "https://github.com/...", // Activity URL
  description: "Linux kernel",  // Optional description
  language: "C",                // For repos: primary language
  stars: 165000,                // For repos: stargazer count
  createdAt: Date,              // Creation date
  updatedAt: Date               // Last update
}
```

### **User Skill**
```javascript
{
  userId: 1,           // User reference
  skill: "Python",     // Skill name
  source: "github",    // Where it was detected (github, luma, etc.)
  activityId: "...",   // Optional reference to activity
  createdAt: Date      // When it was detected
}
```

### **GitHub Enriched Data**
```javascript
{
  username: "torvalds",
  userId: 1,
  profile: {
    name: "Linus Torvalds",
    bio: "Linux creator",
    location: "Portland, OR",
    public_repos: 184,
    followers: 190000,
    following: 0,
    created_at: "2011-09-07T...",
    avatar_url: "https://..."
  },
  repositories: [
    {
      id: 12345,
      name: "linux",
      full_name: "torvalds/linux",
      description: "Linux kernel source tree",
      html_url: "https://github.com/torvalds/linux",
      language: "C",
      stargazers_count: 165000,
      topics: ["kernel", "linux", "os"],
      created_at: "2012-01-04T...",
      updated_at: "2024-05-08T..."
    },
    ...more repos...
  ],
  languages: ["C", "C++", "Python"],
  topics: ["kernel", "linux", "os", "git"]
}
```

---

## Skill Extraction Logic

```
Input: Languages, Topics, Repositories
       │
       ├─────────────────────┬─────────────────────┬────────────────┐
       ↓                     ↓                     ↓                ↓
   Languages          Topics                Descriptions        Stars
   ├─ JavaScript       ├─ machine-learning  ├─ "API"           ├─ 100+ stars
   ├─ Python           ├─ blockchain        ├─ "Database"      └─ OSSContributor
   ├─ Rust             ├─ web3              ├─ "Machine Learning"
   └─ ...              └─ ...               └─ ...
       │                   │                     │
       ↓                   ↓                     ↓
   Language Mapping   Topic Mapping          Description Parsing
   ├─ JS→JavaScript   ├─ ml→ML               ├─ API→API Dev
   ├─ py→Python       ├─ blockchain→Blockchain └─ DB→Database
   └─ ...             └─ ...                    
       │                   │                     │
       └───────────────────┴─────────────────────┘
                           │
                           ↓
                    Set Aggregation
                    (Remove duplicates)
                           │
                           ↓
                    Output Skills Array
                    [
                      "JavaScript",
                      "Python",
                      "Blockchain",
                      "API Development",
                      "Open Source Contributor"
                    ]
```

---

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│  index.js                                                    │
│  ├─ express                                                 │
│  ├─ cors                                                    │
│  ├─ dotenv ← Loads environment variables                   │
│  └─ routes.js                                              │
│                                                              │
│     routes.js                                               │
│     ├─ db.js ← In-memory database                          │
│     ├─ skillEngine.js ← Skill extraction                   │
│     │  (No external deps)                                  │
│     └─ githubService.js                                    │
│        ├─ axios ← HTTP client for GitHub API              │
│        └─ dotenv (via process.env)                         │
│                                                              │
│  .env                                                       │
│  ├─ GITHUB_TOKEN (optional)                               │
│  ├─ GITHUB_API_BASE_URL                                   │
│  └─ PORT                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

```
┌──────────────────────────────────────────────────┐
│           Operation Timing                        │
├──────────────────────────────────────────────────┤
│                                                   │
│ Fetch User Profile      ~100ms                   │
│ Fetch 100 Repos         ~300-500ms               │
│ Skill Extraction        ~50-100ms                │
│ Database Writes         ~10-20ms                 │
│                                                   │
│ Total per user:         ~500ms - 1s              │
│                                                   │
├──────────────────────────────────────────────────┤
│           Rate Limits                            │
├──────────────────────────────────────────────────┤
│                                                   │
│ GitHub API (unauthenticated)  60 req/hour       │
│ GitHub API (with token)       5,000 req/hour    │
│                                                   │
│ Recommendation: Add GitHub token for production │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              Security Layers                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Layer 1: Input Validation                          │
│  ├─ Username validation                             │
│  ├─ UserId validation                               │
│  └─ Input sanitization                              │
│                                                      │
│  Layer 2: Environment Protection                    │
│  ├─ .env file in .gitignore                         │
│  ├─ GITHUB_TOKEN stored securely                    │
│  └─ No secrets in source code                       │
│                                                      │
│  Layer 3: API Access Control                        │
│  ├─ Only reads public GitHub data                   │
│  ├─ No write access to GitHub                       │
│  └─ Limited scope tokens recommended               │
│                                                      │
│  Layer 4: Error Handling                            │
│  ├─ User-friendly error messages                    │
│  ├─ No stack traces exposed                         │
│  └─ Proper HTTP status codes                        │
│                                                      │
│  Layer 5: Rate Limiting                             │
│  ├─ GitHub API rate limits respected               │
│  ├─ Error handling for 429 responses                │
│  └─ Backoff strategies recommended                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
tracecv/
├── apps/
│   └── api/
│       ├── .env.example          ← Configuration template
│       ├── package.json          ← Dependencies (updated)
│       └── src/
│           ├── index.js          ← Server entry point (updated)
│           ├── routes.js         ← API routes (updated)
│           ├── skillEngine.js    ← Skill extraction (enhanced)
│           ├── githubService.js  ← GitHub API client (NEW)
│           └── db.js             ← Database (in-memory)
│
├── QUICK_START.md                ← 5-min setup guide
├── GITHUB_SETUP.md               ← Detailed setup
├── API_EXAMPLES.md               ← 15+ code examples
├── IMPLEMENTATION_SUMMARY.md     ← Technical details
├── GITHUB_INTEGRATION_COMPLETE.md ← Overview (this file type)
└── test-github-integration.sh    ← Automated tests
```

---

This architecture is designed to be:
- **Scalable**: Easy to add new data sources
- **Maintainable**: Clear separation of concerns
- **Secure**: Environment variables, input validation
- **Testable**: All components independently testable
- **Extensible**: Simple to add features and integrations
