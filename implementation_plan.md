# Atlas of Stories — Complete Build Guide (React Edition)

> A fool-proof, step-by-step guide to building the entire project from scratch.
> Follow it top to bottom. Every file. Every command. Every "why."

---

## Table of Contents

1. [What You're Building](#1-what-youre-building)
2. [Prerequisites — Install These First](#2-prerequisites)
3. [Phase 1: Project Setup](#3-phase-1-project-setup)
4. [Phase 2: The Backend (Express API)](#4-phase-2-the-backend)
5. [Phase 3: The Frontend (React + Vite)](#5-phase-3-the-frontend)
6. [Phase 4: Test Locally (No Cloud Needed Yet)](#6-phase-4-test-locally)
7. [Phase 5: GCP Setup (Your Cloud Home)](#7-phase-5-gcp-setup)
8. [Phase 6: Docker (Packaging Your App)](#8-phase-6-docker)
9. [Phase 7: Terraform (Building Cloud Infrastructure)](#9-phase-7-terraform)
10. [Phase 8: Deploy to Cloud Run](#10-phase-8-deploy)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What You're Building

**Atlas of Stories** is a literary map app. You search for a book, and it shows you every real-world location connected to that book on an interactive map — with trivia, quotes, and context.

### Features
- 🔍 **Book search** with autocomplete (powered by Open Library — free, no key needed)
- 🗺️ **Interactive dark map** with color-coded bubble markers
- 📍 **Rich popups** with significance, trivia, and real quotes from the book
- 📖 **Book info panel** with cover art, description, and clickable location list
- 🎲 **"Surprise me" button** — picks from 50 curated world classics
- ⚡ **Caching** — once a book is processed, results are instant forever
- 💰 **Scale-to-zero** — costs $0 when nobody's using it

### Architecture (How Data Flows)

```
You type "Crime and Punishment"
  │
  ▼
React Frontend (your browser)
  │ fetches /api/books/search?q=crime+and+punishment
  ▼
Express Backend (on Cloud Run)
  │
  ├──► Open Library API (free) → returns book info, cover, metadata
  │
  ├──► Firestore Cache → "have we seen this book before?"
  │     ├── YES → return cached locations instantly
  │     └── NO  → continue pipeline ▼
  │
  ├──► Vertex AI Gemini 2.0 Flash → "extract all real locations from this book"
  │     └── returns JSON: [{name, type, significance, trivia, quote}, ...]
  │
  ├──► Google Maps Geocoding API → converts place names to lat/lng coordinates
  │
  ├──► Firestore → cache the results for next time
  │
  └──► sends everything back to your browser
          │
          ▼
   MapLibre renders bubble markers on the map 🎉
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Component-based UI with hot reload |
| Map | MapLibre GL JS | Free, open-source map library |
| Backend | Node.js + Express | Simple, fast API server |
| AI | Vertex AI (Gemini 2.0 Flash) | Extracts locations from books |
| Database | Firestore | Caches results, serverless, free tier |
| Geocoding | Google Maps Geocoding API | Converts "Paris, France" → coordinates |
| Container | Docker | Packages your app for deployment |
| Infrastructure | Terraform | Creates cloud resources with code |
| Hosting | Cloud Run | Runs your container, scales to zero |
| CI/CD | Cloud Build | Auto-deploys when you push to GitHub |

---

## 2. Prerequisites

Install these before starting. You only do this once.

### 2.1 Node.js (v18 or higher)

Node.js lets you run JavaScript outside a browser. Your backend runs on it.

1. Go to https://nodejs.org
2. Download the **LTS** version (should be 18 or 20+)
3. Run the installer, click "Next" through everything
4. Verify it works — open a terminal and run:
   ```bash
   node --version    # should show v18.x.x or higher
   npm --version     # should show 9.x.x or higher
   ```

### 2.2 Git

Git tracks changes to your code. It's also how you'll deploy.

1. Go to https://git-scm.com/downloads
2. Download and install for Windows
3. During install, keep all defaults
4. Verify:
   ```bash
   git --version
   ```

### 2.3 A Code Editor

Use **VS Code** (https://code.visualstudio.com). Install these extensions:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- GitLens

### 2.4 Google Cloud CLI (`gcloud`)

This is how you talk to Google Cloud from your terminal.

1. Go to https://cloud.google.com/sdk/docs/install
2. Download the Windows installer
3. Run it, follow the prompts
4. When it asks to initialize, say yes:
   ```bash
   gcloud init
   ```
5. Log in with your Google account when the browser opens
6. Verify:
   ```bash
   gcloud --version
   ```

### 2.5 Docker Desktop

Docker packages your app into a container (a self-contained box that runs anywhere).

1. Go to https://www.docker.com/products/docker-desktop
2. Download and install for Windows
3. It may ask you to enable WSL 2 — follow the instructions
4. Restart your computer if asked
5. Open Docker Desktop, wait for it to start
6. Verify:
   ```bash
   docker --version
   ```

### 2.6 Terraform

Terraform creates cloud resources (databases, servers, etc.) using code instead of clicking through the GCP Console.

1. Go to https://developer.hashicorp.com/terraform/downloads
2. Download the Windows AMD64 zip
3. Extract `terraform.exe` to a folder (e.g., `C:\terraform\`)
4. Add that folder to your system PATH:
   - Search "Environment Variables" in Windows
   - Edit the `Path` variable under User variables
   - Add `C:\terraform\`
5. Verify:
   ```bash
   terraform --version
   ```

---

## 3. Phase 1: Project Setup

### 3.1 Create the project folder

```bash
mkdir D:\atlas-of-stories
cd D:\atlas-of-stories
```

### 3.2 Initialize Git

```bash
git init
```

### 3.3 Create the folder structure

```bash
mkdir backend
mkdir backend\services
mkdir backend\routes
mkdir backend\prompts
mkdir backend\data
mkdir terraform
```

> [!NOTE]
> The `frontend` folder will be auto-created by Vite in Phase 3. Don't create it manually.

### 3.4 Create `.gitignore`

Create the file `D:\atlas-of-stories\.gitignore`:

```gitignore
# Dependencies
node_modules/

# Environment secrets
.env
.env.local

# Terraform state (contains sensitive info)
terraform/.terraform/
terraform/*.tfstate
terraform/*.tfstate.backup
terraform/terraform.tfvars
terraform/.terraform.lock.hcl

# Build output
frontend/dist/

# IDE
.vscode/
.idea/

# OS junk
.DS_Store
Thumbs.db

# Logs
*.log
```

**Why?** This tells Git to ignore files that shouldn't be in your repository — secrets, downloaded packages, build artifacts, and OS clutter.

### 3.5 Create `.dockerignore`

Create the file `D:\atlas-of-stories\.dockerignore`:

```
node_modules
.git
.gitignore
terraform
*.md
.env
.env.local
.vscode
.idea
```

**Why?** When Docker builds your image, it copies files into the container. This tells it to skip files that would make the image unnecessarily big or leak secrets.

---

## 4. Phase 2: The Backend

The backend is an Express.js API server. It handles search, AI extraction, geocoding, and caching. You'll create **10 files**.

### 4.1 Initialize the backend

```bash
cd D:\atlas-of-stories\backend
npm init -y
```

This creates a basic `package.json`. Now open it and replace the contents with:

**File: `backend/package.json`**
```json
{
  "name": "atlas-of-stories-backend",
  "version": "1.0.0",
  "description": "Backend API for Atlas of Stories",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "@google-cloud/vertexai": "^1.9.0",
    "@google-cloud/firestore": "^7.10.0"
  }
}
```

**What each dependency does:**
| Package | Purpose |
|---------|---------|
| `express` | Web framework — handles HTTP requests, routing |
| `cors` | Allows the React dev server (port 5173) to call the backend (port 8080) |
| `dotenv` | Loads your `.env` file so you can use `process.env.MY_SECRET` |
| `@google-cloud/vertexai` | Talks to Gemini AI |
| `@google-cloud/firestore` | Talks to Firestore database |

Now install everything:

```bash
npm install
```

### 4.2 Create `.env.example`

**File: `backend/.env.example`**
```
# Your GCP project ID (find it in the GCP Console)
GCP_PROJECT_ID=your-project-id

# Google Maps Geocoding API key
GEOCODING_API_KEY=your-api-key-here

# Port (Cloud Run sets this automatically)
PORT=8080

# Environment
NODE_ENV=development
```

Copy this to create your actual env file:
```bash
copy .env.example .env
```

> [!CAUTION]
> Never commit `.env` to Git. It contains secrets. The `.gitignore` already excludes it.

---

### 4.3 Backend Files — Create These One by One

I'll explain each file's job, then show you the code to put in it.

---

#### File 1: `backend/services/cache.js`

**Job:** Talks to Firestore to save and load cached book data. If someone already searched for "Crime and Punishment" yesterday, we don't need to call Gemini again — we just return the cached result.

**What to put in it:**
- Initialize a Firestore client
- `getCachedLocations(workId)` — checks if we have this book cached
- `cacheLocations(workId, data)` — saves a book's locations
- `getRandomCachedBook()` — grabs a random cached book (fallback for surprise feature)

**Key concept:** Firestore is a NoSQL database. Think of it as a giant JSON file in the cloud. Each book gets a "document" identified by its Open Library work ID (like `OL166894W`).

---

#### File 2: `backend/services/openLibrary.js`

**Job:** Calls the free Open Library API to search for books and get details.

**What to put in it:**
- `searchBooks(query)` — calls `openlibrary.org/search.json`, returns titles, authors, covers
- `getBookDetails(workId)` — calls `openlibrary.org/works/{id}.json`, returns description, subjects, places

**Key concept:** Open Library is completely free, no API key needed. Just be polite and include a User-Agent header.

---

#### File 3: `backend/prompts/extractLocations.js`

**Job:** Builds the text prompt that we send to Gemini AI. This is the "instruction manual" that tells Gemini exactly what to extract and how to format it.

**What to put in it:**
- `buildPrompt(bookInfo)` — takes a book's title, author, year, description, and returns a detailed prompt string
- The prompt asks Gemini to return a JSON array of locations, each with: name, type, significance, trivia, quote

**Key concept:** Prompt engineering — the quality of Gemini's output depends heavily on how clear and specific your instructions are. We set temperature to 0.3 (low creativity, high factuality).

---

#### File 4: `backend/services/gemini.js`

**Job:** Sends the prompt to Vertex AI Gemini and parses the response.

**What to put in it:**
- Initialize Vertex AI with your project ID
- `extractLocations(bookInfo)` — builds prompt, calls Gemini, parses JSON response
- Retry logic (try again once if it fails)
- Strip markdown code fences that Gemini sometimes wraps around its output

---

#### File 5: `backend/services/geocoder.js`

**Job:** Converts place names like "St. Petersburg, Russia" into latitude/longitude coordinates using the Google Maps Geocoding API.

**What to put in it:**
- `geocodeLocation(placeName)` — single lookup, returns `{lat, lng, formattedAddress}`
- `geocodeLocations(locations)` — batch geocode with 100ms delay between calls (rate limiting)

---

#### File 6: `backend/data/surpriseBooks.js`

**Job:** A hardcoded list of ~50 classic books with rich geography, used by the "Surprise me" button.

**What to put in it:**
- An array of `{ workId, title, author }` objects
- Diverse world literature: Dostoevsky, Dickens, Hemingway, García Márquez, Achebe, etc.
- Each `workId` is the Open Library identifier (e.g., `OL166894W` for Crime and Punishment)

---

#### File 7: `backend/routes/books.js`

**Job:** Express router that handles book-related API calls.

**Endpoints:**
- `GET /api/books/search?q=crime` — search for books
- `GET /api/books/OL166894W` — get details for one book

---

#### File 8: `backend/routes/locations.js`

**Job:** The MAIN endpoint. This is where the magic happens — it orchestrates the entire pipeline.

**Endpoint:** `GET /api/books/:workId/locations`

**Flow:**
1. Check Firestore cache
2. If cached → return immediately
3. If not → fetch book details → call Gemini → geocode → cache → respond

---

#### File 9: `backend/routes/surprise.js`

**Job:** Returns a random book from the curated list.

**Endpoint:** `GET /api/surprise`

Stores the last pick in memory so you never get the same book twice in a row.

---

#### File 10: `backend/server.js`

**Job:** The main entry point. Glues everything together.

**What it does:**
- Loads environment variables
- Sets up Express with CORS and JSON parsing
- Mounts all the route files
- Serves the frontend's built files from a `public/` folder
- Starts listening on port 8080
- Has a health check at `GET /health`

---

> [!TIP]
> **Build order:** Write the files in the order listed above (1→10). Each file only depends on files created before it. By the time you write `server.js`, everything it imports already exists.

---

## 5. Phase 3: The Frontend (React + Vite)

### 5.1 Create the React app with Vite

From the project root:

```bash
cd D:\atlas-of-stories
npm create vite@latest frontend -- --template react
```

This creates a `frontend/` folder with a React starter. Now install dependencies:

```bash
cd frontend
npm install
npm install maplibre-gl
```

| Package | Why |
|---------|-----|
| `maplibre-gl` | The map library — renders interactive maps |

### 5.2 Clean up the Vite starter

Delete these files that Vite created (you won't need them):
```bash
del src\App.css
del src\index.css
del src\assets\react.svg
```

### 5.3 Set up Vite config

**File: `frontend/vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During development, forward /api calls to your Express backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

**Why the proxy?** In development, React runs on port 5173 and Express runs on port 8080. Without the proxy, your browser would block API calls because they're going to a different port (CORS issue). The proxy makes them look like they're coming from the same server.

### 5.4 Update `frontend/index.html`

Replace the Vite-generated `index.html` with yours. This is the only HTML file in the project:

- Load Google Fonts (Playfair Display, Source Serif 4, Inter) via `<link>`
- Load MapLibre GL CSS from CDN via `<link>`
- A single `<div id="root"></div>` where React will mount
- The Vite module script tag (already there)

### 5.5 Create the CSS design system

**File: `frontend/src/styles/index.css`**

This is the big one — the complete visual identity. Include:

**CSS Custom Properties (variables):**
```css
:root {
  --bg-deep:      #0F0D0B;    /* Page background */
  --bg-surface:   #1A1714;    /* Panels, cards */
  --bg-elevated:  #252019;    /* Hover states */
  --burgundy:     #8B3A3A;    /* Author connection markers */
  --burnt-orange: #C4723A;    /* Plot setting markers */
  --amber:        #D4A053;    /* Highlights, glow */
  --forest:       #4A6B5A;    /* Inspiration markers */
  --parchment:    #E8DCC8;    /* Primary text */
  --cream:        #F5EDE0;    /* Headings */
  --mist:         #9B9083;    /* Secondary text */
  --ink:          #2C2520;    /* Popup backgrounds */
}
```

**Typography:**
- Headings: `'Playfair Display', serif`
- Body: `'Source Serif 4', serif`
- UI/labels: `'Inter', sans-serif`
- Quotes: `'Playfair Display' italic` in amber

**Key CSS features to include:**
- Glassmorphism (semi-transparent backgrounds + `backdrop-filter: blur()`)
- Bubble marker pulse animations (`@keyframes`)
- Surprise button floating animation
- MapLibre popup style overrides (dark ink background, parchment text)
- Panel slide-in/out transition
- Warm sepia filter on the map
- Responsive breakpoint at 768px (panel becomes bottom sheet on mobile)
- Custom scrollbar styling
- Skeleton loading shimmer animation

### 5.6 React Components

Create these files under `frontend/src/components/`. Here's what each one does:

---

**`main.jsx`** — Entry point. Renders `<App />` into the `#root` div. Import your `styles/index.css` here.

---

**`App.jsx`** — The brain. Holds all the app state:
- `currentBook` — which book is selected (null = none)
- `locations` — array of location objects
- `isLoading` — whether we're waiting for the API
- `showWelcome` — controls the welcome overlay

Renders all other components. Passes data down as props. Handles the main `handleBookSelected` flow (fetch locations → update state → markers appear).

---

**`components/SearchBar.jsx`** — The search input at the top center.
- Controlled input with `useState`
- Debounced API call (wait 400ms after user stops typing)
- Shows `<SearchDropdown>` when there are results
- Closes dropdown when you click outside or press Escape

---

**`components/SearchDropdown.jsx`** — The results list below the search bar.
- Receives `results` array as prop
- Each result shows: cover image (or 📖 placeholder), title, author, year
- Clicking a result fires `onSelect(book)` prop

---

**`components/BookPanel.jsx`** — The left sidebar with book info.
- Receives `book`, `locations`, `onLocationClick`, `onClose` as props
- Shows: cover image, title (Playfair Display), author (uppercase, burnt-orange), year
- Description with "Read more..." truncation (local `isExpanded` state)
- Location count badge: "📍 12 locations discovered"
- Scrollable list of locations — each with a colored dot and click handler
- Type legend at the bottom
- Close button (×) in the corner

---

**`components/MapView.jsx`** — The map. This is the trickiest component because MapLibre is imperative (not React-friendly), so you'll use `useRef` and `useEffect`.

**On mount (`useEffect([], ...)`):**
- Create a `new maplibregl.Map()` with CARTO Dark Matter tiles
- Center on [20, 30] (Europe/Mediterranean), zoom 2.5

**When `locations` prop changes (`useEffect([locations], ...)`):**
- Clear old markers
- Create new bubble markers with staggered 80ms delay
- Each marker gets a popup with: name, type badge, significance, trivia, quote
- Fit map bounds to show all markers

**Expose methods** via `forwardRef` + `useImperativeHandle`:
- `flyToLocation(lat, lng)` — zoom to a single point
- `openPopupAt(index)` — open a specific marker's popup

---

**`components/WelcomeOverlay.jsx`** — The "Search for a book to explore its world" text shown when no book is selected. Just a div with Playfair Display italic text.

---

**`components/SurpriseButton.jsx`** — The 🎲 button in the bottom-right corner.
- Calls `GET /api/surprise` on click
- Shows loading state while fetching
- Passes the result to `onBookSelected` prop

---

**`components/LoadingOverlay.jsx`** — Spinner + "Exploring the literary world..." Shown while the backend is processing a book.

---

### 5.7 Utility files

**`src/utils/api.js`** — Centralized API calls:
```js
export async function searchBooks(query) { ... }
export async function getLocations(workId) { ... }
export async function getSurpriseBook() { ... }
```

**`src/hooks/useBookSearch.js`** — Custom hook for debounced search:
```js
// Takes query string, returns { results, isLoading }
// Internally uses setTimeout for debounce + fetch
```

---

> [!IMPORTANT]
> **Build order for components:** Start with `App.jsx` (just a skeleton), then build one component at a time. Test each one before moving to the next. Suggested order:
> 1. `MapView` — get the map rendering first
> 2. `WelcomeOverlay` + `LoadingOverlay` — simple, boosts morale
> 3. `SearchBar` + `SearchDropdown` — can test with the real Open Library API
> 4. `BookPanel` — needs location data, so mock it initially
> 5. `SurpriseButton` — easy, connects everything
> 6. Wire it all together in `App.jsx`

---

## 6. Phase 4: Test Locally

### 6.1 Start the backend

```bash
cd D:\atlas-of-stories\backend
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════╗
║        📚 Atlas of Stories — Backend         ║
║        Listening on port 8080               ║
╚══════════════════════════════════════════════╝
```

Test it: open `http://localhost:8080/health` in your browser. You should see `{"status":"ok"}`.

### 6.2 Start the React dev server

Open a **second terminal**:

```bash
cd D:\atlas-of-stories\frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

### 6.3 Test the search (works without GCP!)

Open `http://localhost:5173` in your browser. The map should render. Try searching for a book — the search should work because Open Library is free and needs no API key.

> [!NOTE]
> The **location extraction** won't work yet because it needs GCP (Gemini + Geocoding + Firestore). That's Phase 5-8. But you can build and test the entire UI first with mock data.

### 6.4 Mock data for testing without GCP

To test the full UI before setting up GCP, you can temporarily make your locations endpoint return hardcoded data. In `routes/locations.js`, add a mock response at the top of the handler — remove it once GCP is set up.

---

## 7. Phase 5: GCP Setup

This is where you set up your Google Cloud project. You do this once.

### 7.1 Create a GCP account

1. Go to https://cloud.google.com
2. Click "Get started for free"
3. You get **$300 in free credits** for 90 days
4. Add a payment method (you won't be charged unless you exceed the free tier)

### 7.2 Create a project

```bash
gcloud projects create atlas-of-stories-YOUR-NAME --name="Atlas of Stories"
gcloud config set project atlas-of-stories-YOUR-NAME
```

> Replace `YOUR-NAME` with something unique — project IDs must be globally unique across all of Google Cloud.

### 7.3 Link billing

1. Open https://console.cloud.google.com/billing
2. Link your new project to the billing account that has the $300 credit

### 7.4 Enable the APIs your app needs

```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  geocoding-backend.googleapis.com
```

**What each API does:**
| API | Purpose |
|-----|---------|
| `run` | Cloud Run — hosts your app |
| `firestore` | Database for caching |
| `cloudbuild` | CI/CD — builds your Docker image |
| `artifactregistry` | Stores your Docker images |
| `secretmanager` | Securely stores API keys |
| `aiplatform` | Vertex AI — gives you access to Gemini |
| `geocoding-backend` | Google Maps Geocoding |

### 7.5 Create Firestore database

```bash
gcloud firestore databases create --location=us-central1
```

### 7.6 Create a Geocoding API key

1. Go to https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the key
4. Click **"Restrict key"** → under "API restrictions", select **"Geocoding API"** only
5. Save

Now store it in Secret Manager:
```bash
echo "YOUR_API_KEY_HERE" | gcloud secrets create geocoding-api-key --data-file=-
```

And put it in your local `.env`:
```
GCP_PROJECT_ID=atlas-of-stories-YOUR-NAME
GEOCODING_API_KEY=YOUR_API_KEY_HERE
```

### 7.7 Authenticate locally

This lets your local machine talk to GCP services:

```bash
gcloud auth application-default login
```

A browser will open — log in with your Google account. Now your backend can talk to Firestore, Gemini, etc. from your laptop.

### 7.8 Test the full pipeline locally

Restart your backend (`npm run dev`), open the React app, search for a book, and click a result. It should now:
1. Call Open Library ✅
2. Call Gemini to extract locations ✅
3. Geocode the locations ✅
4. Cache them in Firestore ✅
5. Show markers on the map ✅

The first search for any book takes 10-20 seconds (Gemini + geocoding). After that it's instant (cached).

---

## 8. Phase 6: Docker

### 8.1 What is Docker?

Think of Docker as a **shipping container for your app**. It packages your code, Node.js, and all dependencies into a single box that runs identically everywhere — your laptop, Cloud Run, any server.

Without Docker: "It works on my machine!" 😤
With Docker: "It works in the container, and the container runs everywhere." 😎

### 8.2 Create the Dockerfile

**File: `D:\atlas-of-stories\Dockerfile`**

```dockerfile
# ── Stage 1: Build the React frontend ──────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
# Output: /frontend/dist/ (static HTML/CSS/JS files)

# ── Stage 2: Production server ─────────────────────────────
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
# Copy the built React app into Express's public folder
COPY --from=frontend-build /frontend/dist ./public/
EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

**What's happening here:**
1. **Stage 1:** Install React dependencies, run `npm run build`, which compiles JSX → static files
2. **Stage 2:** Install backend dependencies, copy backend code + built frontend into `public/`
3. The final image only contains what's needed to run — no React dev tools, no source maps

### 8.3 Test the Docker build locally

```bash
cd D:\atlas-of-stories
docker build -t atlas-of-stories .
```

This takes 1-3 minutes the first time. If it succeeds, test it:

```bash
docker run -p 8080:8080 --env-file backend/.env atlas-of-stories
```

Open `http://localhost:8080` — you should see the app!

> [!NOTE]
> Gemini and Firestore won't work inside Docker locally because the container doesn't have your Google credentials. That's fine — they'll work on Cloud Run because Cloud Run has its own service account.

---

## 9. Phase 7: Terraform

### 9.1 What is Terraform?

Terraform lets you describe your cloud infrastructure in code files instead of clicking through the GCP Console. Benefits:
- **Repeatable** — run `terraform apply` and everything gets created
- **Version controlled** — your infra is in Git alongside your code
- **Deletable** — `terraform destroy` removes everything cleanly

### 9.2 Create the Terraform files

You need 8 files in the `terraform/` folder. Here's what each one does:

| File | Creates |
|------|---------|
| `main.tf` | Configures the Google Cloud provider, enables all APIs |
| `variables.tf` | Defines configurable values (project ID, region) |
| `terraform.tfvars.example` | Example values — copy to `terraform.tfvars` |
| `iam.tf` | Service account for Cloud Run + its permissions |
| `firestore.tf` | Firestore database |
| `artifact_registry.tf` | Docker image repository |
| `secrets.tf` | Secret Manager secret + access permissions |
| `cloudrun.tf` | The Cloud Run service itself |
| `cloudbuild.tf` | Cloud Build IAM permissions |
| `outputs.tf` | Prints useful values (URL, service account) after deploy |

### 9.3 Initialize and apply

```bash
cd D:\atlas-of-stories\terraform

# Copy and edit the variables
copy terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set your project_id

# Initialize Terraform (downloads the Google Cloud plugin)
terraform init

# Preview what will be created
terraform plan

# Create everything (type "yes" when prompted)
terraform apply
```

This takes 2-5 minutes. When it finishes, it prints the Cloud Run URL.

> [!WARNING]
> If you already created the Firestore database manually in Phase 5, Terraform might error on the `google_firestore_database` resource. Either import it with `terraform import` or remove that resource from `firestore.tf`.

---

## 10. Phase 8: Deploy

### 10.1 Create the Cloud Build config

**File: `D:\atlas-of-stories\cloudbuild.yaml`**

This file tells Cloud Build what to do when you deploy:
1. Build the Docker image
2. Push it to Artifact Registry
3. Deploy it to Cloud Run

### 10.2 Deploy!

```bash
cd D:\atlas-of-stories
gcloud builds submit --config=cloudbuild.yaml
```

This takes 3-5 minutes. It:
1. Uploads your code to Cloud Build
2. Builds the Docker image in the cloud
3. Pushes it to Artifact Registry
4. Deploys it to Cloud Run

When done, it prints the URL. Open it — your app is live! 🎉

### 10.3 Alternatively: Quick deploy without cloudbuild.yaml

If you just want to deploy quickly without a pipeline:

```bash
gcloud run deploy atlas-of-stories \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets "GEOCODING_API_KEY=geocoding-api-key:latest" \
  --set-env-vars "GCP_PROJECT_ID=YOUR_PROJECT_ID"
```

---

## 11. Troubleshooting

### "Cannot find module" errors
You forgot to run `npm install` in either `backend/` or `frontend/`.

### "GEOCODING_API_KEY is not set"
You haven't created the `.env` file, or haven't set the secret in Secret Manager for production.

### Map doesn't load
Check your browser console (F12 → Console tab). If it says something about MapLibre, make sure the CDN link in `index.html` is correct.

### Gemini returns empty locations
Check the backend logs. Common issues:
- `GCP_PROJECT_ID` not set
- Haven't run `gcloud auth application-default login` locally
- The Vertex AI API isn't enabled

### "Permission denied" on Firestore/Gemini
Your service account doesn't have the right roles. Check `terraform/iam.tf` and make sure `terraform apply` ran successfully.

### Docker build fails
Make sure Docker Desktop is running. The whale icon should be in your system tray.

### React dev server can't reach the backend
Make sure the backend is running on port 8080 AND the Vite proxy in `vite.config.js` is configured.

---

> [!TIP]
> **Build this project incrementally.** Don't try to write all 20+ files in one sitting. Go phase by phase:
> 1. Get the backend running and test each endpoint with your browser
> 2. Get the React map rendering with mock data
> 3. Connect search to the real API
> 4. Connect the full pipeline once GCP is set up
> 5. Dockerize and deploy last
>
> Each phase gives you a working milestone you can see and feel good about.
