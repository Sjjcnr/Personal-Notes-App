# 📝 Personal Notes App (Antigravity) — Comprehensive Codebase Analysis & Technical Reference

> **Project Path:** `C:\Users\91638\OneDrive\Desktop\Antigravity\Personal notes app (Antigravity)`  
> **Application Type:** AI-Powered Full-Stack Knowledge Base & Markdown Note-Taking Application  
> **Architecture:** Monolithic Full-Stack (Express 5 REST API + React 19 Single Page App)  
> **License:** ISC  

---

## 1. Executive Summary

**Personal Notes App (Antigravity)** is an intelligent, full-stack personal knowledge management (PKM) platform built with the MERN stack (MongoDB, Express, React, Node.js). It integrates **Google Gemini 2.5 Flash** for AI-assisted writing, auto-tagging, content expansion, and a grounded **Retrieval-Augmented Generation (RAG) assistant** that answers user questions based strictly on their personal notes repository.

### Core Problems Solved
1. **Unorganized Thought Capture:** Users often struggle with categorization and metadata. The platform provides automated AI categorization and tag generation.
2. **Knowledge Retrieval Bottlenecks:** Traditional note apps rely strictly on manual keyword search. Antigravity introduces an AI assistant that synthesizes answers across the user's entire note corpus.
3. **Sharing & Collaboration Friction:** Notes can be published to a unique public UUID link for unauthenticated viewing with rendered GitHub Flavored Markdown (GFM).
4. **Drafting & Polishing Overhead:** Includes multi-tone AI rewrites (Professional, Casual, Expand, Summarize) and instant note generation from title prompts.

---

## 2. Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vite + React)                         │
│  - React 19.2 / Vite 8.0 / React Router 7.13                           │
│  - React Markdown 10.1 + Remark GFM 4.0 (Live Markdown Render)         │
│  - Responsive Dark/Light Theme System (CSS Custom Properties)          │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │ HTTP / REST APIs (Credentials: include, Session Cookie)
┌──────────────────▼─────────────────────────────────────────────────────┐
│                       BACKEND (Node.js + Express 5)                    │
│  - Express 5.2.1 / express-session / CORS / bcryptjs 3.0               │
│  - Protected Route Middleware (requireAuth)                            │
│  - Static Asset Delivery (client/dist)                                 │
└──────────────────┬────────────────────────────────┬────────────────────┘
                   │                                │
        Mongoose 9.1.5 ODM              Google Gen AI SDK (@google/generative-ai)
                   │                                │
┌──────────────────▼───────────────┐   ┌────────────▼────────────────────────────┐
│         MONGODB DATABASE         │   │        GOOGLE GEMINI 2.5 FLASH          │
│  - Users Collection (Auth)       │   │  - Rewrite (4 styles: prof/cas/exp/sum) │
│  - Notes Collection (Metadata)   │   │  - Auto-Tag & Category Classification   │
│  - Public Share IDs (UUID v4)    │   │  - Grounded RAG Chat with Notes         │
└──────────────────────────────────┘   │  - Topic-to-Note Generation             │
                                       └─────────────────────────────────────────┘
```

### Detailed Tech Stack Breakdown

| Layer | Technologies & Libraries | Key Responsibilities |
|---|---|---|
| **Frontend Framework** | React 19.2.4, Vite 8.0.0, React Router DOM 7.13.1 | Single-page application, client routing, modern React 19 concurrent features |
| **Markdown Processing** | `react-markdown` 10.1.0, `remark-gfm` 4.0.1 | GitHub-flavored markdown parsing, tables, strikethrough, checklists, code blocks |
| **Styling & Theming** | Vanilla CSS3 (33KB custom stylesheet), CSS Custom Properties | Semantic design system, smooth glassmorphism, responsive mobile-friendly dark/light theme |
| **Backend Framework** | Node.js, Express 5.2.1, `dotenv` 17.3.1 | RESTful API endpoints, request routing, error handling, static file hosting |
| **Security & Auth** | `bcryptjs` 3.0.3, `express-session` 1.19.0, `cors` 2.8.6 | Salted password hashing (cost factor: 10), HTTP session cookies, secure CORS handling |
| **Database & ODM** | MongoDB, Mongoose 9.1.5 | Document modeling, schema validation, relational user references, indexing |
| **AI Engine** | Google Generative AI SDK (`@google/generative-ai` 0.24.1) | Gemini 2.5 Flash model invocation for chat, rewriting, tagging, and generation |
| **Identifiers & Export**| `uuid` 13.0.0, Client-side Blob API | Cryptographically strong share IDs, instantaneous `.md` Markdown file export |

---

## 3. Directory & File Structure

```
Personal notes app (Antigravity)/
├── .env                          # Backend environment variables (PORT, MONGODB_URI, GEMINI_API_KEY)
├── index.js                      # Express 5 server: routes, session auth, AI handlers, static serving
├── package.json                  # Backend dependencies & npm scripts (dev, start, build)
│
├── config/
│   └── gemini.js                 # GoogleGenerativeAI client initialization
│
├── models/
│   ├── userModel.js              # Mongoose user schema (username, email, password)
│   └── noteModel.js              # Mongoose note schema (title, content, tags, pinned, trash, shareId)
│
├── public/                       # Static public assets
│
└── client/                       # React 19 Frontend (Vite)
    ├── index.html                # HTML entry point
    ├── package.json              # Frontend dependencies (react-markdown, react-router-dom)
    ├── vite.config.js            # Vite build configuration with development proxy
    │
    └── src/
        ├── App.jsx               # Root router, global theme provider, auth checker, toast provider
        ├── index.css             # Unified 33KB stylesheet with themes, badges, modals, markdown styling
        ├── main.jsx              # React DOM render entry
        │
        ├── pages/
        │   ├── Login.jsx         # User login form with credentials handling
        │   ├── Register.jsx      # New account registration form
        │   ├── Notes.jsx         # Main dashboard: note feed, search, filter pills, trash, pin
        │   ├── Profile.jsx       # User stats, username/email updates, password change
        │   └── SharedNote.jsx    # Unauthenticated public note reader (GFM rendered)
        │
        └── components/
            ├── NoteCard.jsx      # Note card with GFM render, pin, trash, tags, export .md
            ├── NoteForm.jsx      # Note creator with AI toolbar (Rewrite, Auto-tag, Generate)
            ├── EditModal.jsx     # Full-featured modal note editor with AI tools
            ├── ShareModal.jsx    # Public link generator with one-click clipboard copy
            ├── AIChatModal.jsx   # RAG conversational interface over user notes
            └── Toast.jsx         # Floating notification banner (success/error)
```

---

## 4. Key Functional Modules & Technical Mechanics

### 4.1. Context-Aware "Ask AI About Your Notes" (`/notes/ai/chat`)
- **Mechanism (In-Context Retrieval):**
  1. The user asks a question in the `AIChatModal.jsx` (e.g., *"What were my project goals?"*).
  2. The server queries the MongoDB database for all notes belonging to `req.session.userId`.
  3. Notes are serialized into an informative context block containing titles, categories, dates, tags, and contents.
  4. The model (`gemini-2.5-flash`) is provided with strict grounding system instructions:
     - Answer directly and concisely.
     - Answer **strictly** based on the provided notes context.
     - If the context does not contain the answer, politely respond: *"I couldn't find anything related to that in your notes."* (prevents hallucinations).
  5. The generated markdown answer is displayed to the user.
- **Architectural Distinction:** This operates as **in-context prompt retrieval** rather than vector-database RAG (no vector embeddings or chunking), making it straightforward, cost-effective, and fast for personal note volumes.

### 4.2. Multi-Tone Note Polishing & Rewriting (`/notes/ai/rewrite`)
- Accepts existing note `title`, `content`, and a `style` parameter:
  - **Default:** Fixes grammar and enhances clarity.
  - **Professional:** Re-structures note with professional, concise, structured tone.
  - **Casual:** Formats content into a friendly, casual, accessible tone.
  - **Expand:** Elaborates on key ideas, adding depth and detail.
  - **Summarize:** Extracts key points into clean bulleted summaries.
- Enforces strict raw JSON output parsing (`{ "title": "...", "content": "..." }`), updating form state dynamically without page reload.

### 4.3. Automated Categorization & Auto-Tagging (`/notes/ai/auto-tag`)
- Automatically inspects note contents and assigns:
  - Strict Category: Selected from `"Personal"`, `"Work"`, or `"Study"`.
  - Up to 5 short, one-word lowercase keyword tags.
- Fallback validation ensures the category defaults to `"Personal"` if malformed.

### 4.4. Instant Topic-to-Note Generation (`/notes/ai/generate`)
- Generates structured, comprehensive note outlines directly from just a user-supplied title or idea prompt.

### 4.5. Note Management, Pinning, and Soft-Delete Trash System
- **Sorting Algorithm:** Pinned notes are prioritized at the top of the feed, followed by reverse chronological creation date:
  ```javascript
  data.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  ```
- **Trash Bin Lifecycle:**
  - `isTrashed: true` moves a note out of active view into the Trash view.
  - Users can toggle view mode between `📝 Active Notes` and `🗑️ Trash`.
  - In Trash view, notes can either be restored (`♻️`) or permanently wiped (`🔥` via `DELETE /notes/delete/:id`).

### 4.6. Public Sharing & Instant Markdown Export
- **Public Links:** Toggling share generates a `uuidv4()` identifier stored in `shareId`. The note is immediately accessible at `/shared/:shareId` without requiring an account.
- **Client-Side Export:** Directly packages the note title and content into a downloadable `.md` file using browser Blob objects:
  ```javascript
  const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  a.click();
  ```

---

## 5. Database Schema & Data Models (MongoDB / Mongoose)

### User Model (`models/userModel.js`)
```javascript
const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now }
});
```

### Note Model (`models/noteModel.js`)
```javascript
const noteSchema = mongoose.Schema({
  title:     { type: String, required: true },
  content:   { type: String, required: true },
  category:  { type: String, default: "Personal" }, // 'Personal' | 'Work' | 'Study'
  tags:      { type: [String], default: [] },
  isPublic:  { type: Boolean, default: false },
  shareId:   { type: String, default: "" },         // UUID v4 when shared
  isPinned:  { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 6. Complete API Reference

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Creates a new user with bcrypt-hashed password |
| `POST` | `/auth/login` | No | Validates credentials and sets `req.session.userId` |
| `GET` | `/auth/me` | No | Verifies active session and returns user identity |
| `POST` | `/auth/logout` | No | Destroys current session cookie |
| `GET` | `/auth/profile` | Yes (`requireAuth`) | Returns username, email, join date, and total note count |
| `PUT` | `/auth/profile/update` | Yes (`requireAuth`) | Updates username and email with uniqueness checks |
| `PUT` | `/auth/password/change`| Yes (`requireAuth`) | Verifies old password and hashes new password |
| `GET` | `/notes` | Yes (`requireAuth`) | Retrieves all notes belonging to the logged-in user |
| `GET` | `/notes/tags` | Yes (`requireAuth`) | Fetches distinct array of tags across user notes |
| `GET` | `/notes/:id` | Yes (`requireAuth`) | Retrieves single note by MongoDB `_id` |
| `POST` | `/notes/add` | Yes (`requireAuth`) | Creates a new note with formatted lowercase tags |
| `PUT` | `/notes/update/:id` | Yes (`requireAuth`) | Updates note fields (content, title, pin, trash status) |
| `DELETE`| `/notes/delete/:id` | Yes (`requireAuth`) | Permanently deletes note document from database |
| `POST` | `/notes/share/:id` | Yes (`requireAuth`) | Toggles `isPublic` status and generates/removes UUID `shareId` |
| `GET` | `/public/:shareId` | No | Public read-only endpoint returning shared note & author |
| `POST` | `/notes/ai/rewrite` | Yes (`requireAuth`) | AI rewriting with tone modifiers (returns JSON) |
| `POST` | `/notes/ai/auto-tag` | Yes (`requireAuth`) | AI category classification and tag generation |
| `POST` | `/notes/ai/chat` | Yes (`requireAuth`) | Grounded RAG conversational Q&A over all user notes |
| `POST` | `/notes/ai/generate`| Yes (`requireAuth`) | AI content drafting from topic or title |

---

## 7. Environment Configuration

```env
PORT=3500
MONGODB_URI=mongodb://127.0.0.1:27017/notesdb
GEMINI_API_KEY=AIzaSy...
```

---

## 8. Resume-Ready Highlights & Technical Bullet Points

- **Full-Stack Knowledge Base Application:** Designed and deployed a full-stack note-taking system using **MongoDB, Express 5, React 19, Node.js**, and **Vite**, featuring session authentication and Markdown rendering.
- **Retrieval-Augmented Generation (RAG) Assistant:** Implemented a contextual AI assistant powered by **Google Gemini 2.5 Flash** (`@google/generative-ai`), dynamically vectoring and grounding user queries strictly against their personal notes database to eliminate hallucinations.
- **AI-Powered Authoring Suite:** Engineered automated note rewriting across 4 customizable stylistic registers (Professional, Casual, Expand, Summarize) and automated note categorization with structured JSON output schemas.
- **Modular Data Architecture:** Built schema models with **Mongoose 9** supporting soft-delete trashing, pinned prioritization, multi-tag indexing, and cryptographically secure **UUID v4** public note sharing links.
- **Client-Side Markdown Pipeline:** Integrated **React Markdown and Remark GFM** for live rendering of GitHub Flavored Markdown (tables, checklists, code blocks) with native client-side **Blob-based `.md` file export**.
