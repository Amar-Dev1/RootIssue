<div align="center">

<h1>🔍 RootIssue</h1>

<p><strong>Turn GitHub Issues into structured, AI-powered implementation plans — instantly.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Chrome_Extension-MV3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension MV3" />
  <img src="https://img.shields.io/badge/Hono-API-E36002?style=flat-square&logo=hono&logoColor=white" alt="Hono API" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflareworkers&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Gemini_2.5-AI_Powered-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p>
  <a href="#-demo">Demo</a> ·
  <a href="#-how-it-works">How it Works</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-project-structure">Project Structure</a> ·
  <a href="#-getting-started">Getting Started</a>
</p>

</div>

---

## ✨ What is RootIssue?

RootIssue is a **Chrome Extension** that reads the GitHub issue you have open, intelligently identifies the most relevant source files in the repository, and uses a two-stage AI pipeline to generate a clean, focused Markdown implementation plan — right in your browser sidebar.

No context switching. No manual digging. Just open an issue and click **Generate Plan**.

---

## 🎬 Demo

> *(Coming soon — short screen recording of extension in action)*

---

## ⚙️ How It Works

The generation pipeline runs in **three sequential stages**, coordinated between the Chrome Extension popup and a background service worker:

```
User opens a GitHub Issue
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                           │
│                                                                   │
│  1. Install & Setup                                               │
│     ├─ Generate unique user_id                                    │
│     ├─ Request GitHub token (public or private repos)            │
│     └─ Allocate 5 daily credits (refills every 24h)              │
│                                                                   │
│  2. Issue Detection                                               │
│     ├─ Parse owner/repo/issue# from the active tab URL           │
│     ├─ Fetch issue title + body via GitHub API                   │
│     └─ Fetch full file tree of the repository                    │
│                                                                   │
│  3. Generate Plan (click button → background service worker)     │
│     ├─ Stage 1 → Send {issue, file tree} to ExplorerLLM         │
│     ├─ Stage 2 → Fetch content of identified files from GitHub  │
│     └─ Stage 3 → Send {issue, file contents} to PlannerLLM     │
│                                                                   │
│  4. Display                                                       │
│     ├─ Render Markdown plan in popup                             │
│     └─ Deduct 1 credit                                           │
└───────────────────────────────────────────────────────────────────┘
        │                             │
        │ POST /explore-tree          │ POST /generate-plan
        ▼                             ▼
┌─────────────────────────────────────────────────┐
│                  Hono API (Edge)                 │
│                                                  │
│  /authorize/:user_id/:plan                      │
│  └─ Upsert user record in Cloudflare D1         │
│                                                  │
│  /explore-tree/:user_id/:plan                   │
│  └─ ExplorerLLM: identify ≤5 relevant files     │
│                                                  │
│  /generate-plan                                  │
│  └─ PlannerLLM: generate Markdown plan          │
│                                                  │
│  ⚡ Runtime: Cloudflare Workers + Gemini 2.5    │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

![RootIssue Architecture Diagram](./RootIssue%20architecture.png)

### Two-Stage AI Pipeline

| Stage | Model | Input | Output |
|-------|-------|-------|--------|
| **ExplorerLLM** | Gemini 2.5 Flash Lite | Issue text + repo file tree | Up to 5 relevant file paths |
| **PlannerLLM** | Gemini 2.5 Flash Lite | Issue text + file contents | Markdown implementation plan |

### Background-Aware Execution

Plan generation runs inside a **Manifest V3 service worker** (`background.ts`), meaning:

- 🔁 The request **keeps running** even if the user closes the popup mid-generation
- 💾 Progress is persisted in `chrome.storage.local` (`GenerationStatus`)
- 🔄 Reopening the popup **restores the exact loading state** (step 1, 2, or 3)
- ✅ On completion, the popup reads the cached plan from storage and renders it

---

## 📁 Project Structure

```
RootIssue/
├── api/                          # Hono API (Cloudflare Workers)
│   └── src/
│       ├── index.ts              # Route definitions
│       ├── controllers/
│       │   └── planController.ts # Request handlers
│       ├── services/
│       │   └── planService.ts    # Business logic
│       ├── ai/
│       │   └── llms.ts           # ExplorerLLM + PlannerLLM
│       ├── db/                   # Cloudflare D1 integration
│       └── types/
│           └── index.ts          # Shared type definitions
│
└── ui/                           # Chrome Extension (React + Vite)
    ├── background.ts             # Service worker — runs generation pipeline
    ├── public/
    │   └── manifest.json         # MV3 manifest with host_permissions
    └── src/
        ├── App.tsx               # Main state machine + storage listeners
        ├── components/
        │   ├── views/
        │   │   ├── OnboardingView.tsx   # Token setup & settings
        │   │   ├── IdleView.tsx         # Ready to generate state
        │   │   ├── LoadingView.tsx      # Step-by-step progress UI
        │   │   ├── ResultView.tsx       # Renders the Markdown plan
        │   │   └── ErrorView.tsx        # Contextual error messages
        │   ├── Header.tsx
        │   ├── Footer.tsx
        │   ├── IssueContextCard.tsx
        │   └── MarkdownViewer.tsx
        ├── services/
        │   ├── index.ts          # API client (ExplorerLLM, PlannerLLM)
        │   └── github.ts         # GitHub API (issues, tree, file content)
        └── utils/
            └── storage.ts        # chrome.storage.local helpers + state types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 / **Bun**
- A **Google Gemini API Key** (two keys recommended — one per LLM stage)
- A **Cloudflare account** (for Workers + D1 database)
- **Chrome** or a Chromium-based browser

---

### 1. API — Hono + Cloudflare Workers

```bash
cd api
bun install          # or: npm install
```

Create a `.dev.vars` file in `api/`:

```env
GEMINI_API_KEY1=your_explorer_gemini_key
GEMINI_API_KEY2=your_planner_gemini_key
```

Run locally:

```bash
bun run dev          # Starts at http://localhost:8787
```

---

### 2. Chrome Extension — React + Vite

```bash
cd ui
npm install
```

Create a `.env` file in `ui/`:

```env
VITE_BACKEND_URL=http://localhost:8787/api/v1
```

Build the extension:

```bash
npm run build        # Outputs to ui/dist/
```

Load in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `ui/dist/` folder
4. Navigate to any GitHub issue and click the RootIssue icon

---

## 🔑 Permissions

| Permission | Purpose |
|-----------|---------|
| `tabs` | Read the active tab URL to detect GitHub issues |
| `storage` | Persist settings, generation state, and cached plans |
| `identity` | User identification |
| `http://localhost/*` | Connect to local Hono dev server |
| `https://api.github.com/*` | Fetch issue details, repo tree, and file contents |

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <sub>Built with ☕ and a lot of GitHub issues to solve.</sub>
</div>
