<div align="center">

# 📝 Personal Notes App

### An AI-Powered Full-Stack Notes Application

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

A modern, full-stack personal notes application with **AI superpowers**. Create, organize, share, and enhance your notes with the help of Google's Gemini AI — featuring smart rewriting, auto-tagging, content generation, and a conversational AI assistant that can answer questions about your notes.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 📋 Core Notes Management
- **Create, Read, Update, Delete** — Full CRUD operations for your personal notes
- **Rich Categories** — Organize notes into `Personal`, `Work`, or `Study` categories
- **Tags System** — Add custom tags to notes for granular organization
- **Pin Notes** — Pin important notes to keep them at the top
- **Trash & Restore** — Soft-delete notes (`isTrashed`) with restore support, alongside permanent deletion

### 🤖 AI-Powered Features (Google Gemini 2.5 Flash)
- **✍️ Smart Rewrite** — Polish notes with Gemini AI writing assistance:
  - Quick UI action buttons: `Pro` (formal/structured), `Summarize` (bullet points), and `Fix Grammar` (grammar/readability)
  - Backend API styles supported: `professional`, `casual`, `expand`, `summarize`, and default grammar fix
- **🏷️ Auto-Tag** — AI automatically suggests the best category and up to 5 relevant tags
- **📝 Content Generation** — Enter a title and let AI generate a well-structured note for you
- **💬 AI Chat Assistant** — Ask questions about ALL your notes and get intelligent, context-aware answers

### 🔐 Authentication & User Management
- **Secure Registration & Login** — Session-based authentication with bcrypt password hashing
- **User Profiles** — View and update your username, email, and account details
- **Password Change** — Securely change your password with current-password verification

### 🔗 Sharing
- **Public Sharing** — Generate unique shareable links for any note
- **Toggle Sharing** — Easily share or unshare notes with a single click
- **Public View** — Anyone with the link can view shared notes (no login required)

### 🎨 User Interface
- **Modern React SPA** — Smooth, responsive single-page application
- **Markdown Rendering** — Note cards and public shared notes render GitHub Flavored Markdown (GFM) via `react-markdown` (editor uses plain text)
- **Toast Notifications** — Elegant feedback for all user actions
- **Search & Filter** — Find notes by title, content, category, or tags
- **Edit Modal** — Quick inline editing without leaving the notes view

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Express.js 5** | Web framework & REST API server |
| **MongoDB + Mongoose 9** | NoSQL database with ODM (Mongoose v9.1.5) |
| **bcryptjs** | Password hashing (salt rounds: 10) |
| **express-session** | Server-side session management (MemoryStore, 24hr cookie) |
| **@google/generative-ai** | Google Gemini AI integration |
| **uuid** | Unique share link generation |
| **dotenv** | Environment variable management |
| **cors** | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with modern hooks |
| **React Router DOM 7** | Client-side routing & navigation |
| **Vite 8** | Lightning-fast dev server & build tool |
| **react-markdown** | Markdown rendering in notes |
| **remark-gfm** | GitHub Flavored Markdown support |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Sjjcnr/Personal-Notes-App.git
cd Personal-Notes-App
```

### 2. Set Up Environment Variables

Copy the example environment file or create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the environment variables in `.env`:

```env
PORT=3500
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/notesdb
SESSION_SECRET=your_long_random_session_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 **Tip:** For cloud deployment, replace `MONGODB_URI` with your MongoDB Atlas connection string. In production (`NODE_ENV=production`), `SESSION_SECRET` is required and must be at least 32 characters long. In development, a random per-process secret is generated if omitted.

### 3. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 4. Run the Application

**Development Mode** (both server & client separately):

```bash
# Terminal 1 — Start the backend server
npm run dev

# Terminal 2 — Start the React dev server
cd client
npm run dev
```

- Backend runs on: `http://localhost:3500`
- Frontend runs on: `http://localhost:5173`

**Production Mode** (single server):

```bash
# Build the client
npm run build

# Start the production server
npm start
```

> In production mode, Express serves the React build from `client/dist/`.

---

## 📡 API Reference

### Authentication Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login with email & password |
| `GET` | `/auth/me` | ❌ | Get current session user |
| `POST` | `/auth/logout` | ❌ | Destroy current session |
| `GET` | `/auth/profile` | ✅ | Get full user profile |
| `PUT` | `/auth/profile/update` | ✅ | Update username/email |
| `PUT` | `/auth/password/change` | ✅ | Change password |

### Notes Routes (All Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/notes/add` | Create a new note |
| `GET` | `/notes` | Get all user's notes |
| `GET` | `/notes/tags` | Get unique tags for user |
| `GET` | `/notes/:id` | Get a specific note |
| `PUT` | `/notes/update/:id` | Update a note (content, tags, pin status, or soft-delete trash flag) |
| `DELETE` | `/notes/delete/:id` | Permanently delete a note |
| `POST` | `/notes/share/:id` | Toggle note sharing |

### AI Routes (All Protected)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/notes/ai/rewrite` | `{ title, content, style }` | Rewrite note content |
| `POST` | `/notes/ai/auto-tag` | `{ title, content }` | Auto-categorize & tag |
| `POST` | `/notes/ai/chat` | `{ question }` | Chat with your notes |
| `POST` | `/notes/ai/generate` | `{ title }` | Generate note from title |

### Public Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/public/:shareId` | ❌ | View shared note JSON payload (displayed at `/shared/:shareId`) |

---

## 📁 Project Structure

```
Personal-Notes-App/
├── index.js                  # Express server, routes, and middleware
├── package.json              # Server dependencies & scripts
├── .env.example              # Environment variables template
├── .gitignore
│
├── config/
│   └── gemini.js             # Google Gemini AI client initialization
│
├── models/
│   ├── noteModel.js          # Mongoose schema: Note (title, content, category, tags, sharing, etc.)
│   └── userModel.js          # Mongoose schema: User (username, email, password, timestamps)
│
├── public/                   # Legacy static HTML (Express serves client/dist in production)
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── style.css
│
└── client/                   # React 19 + Vite frontend
    ├── package.json
    ├── index.html
    ├── vite.config.js
    │
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Root component with routing
        ├── App.css
        ├── index.css         # Global styles
        │
        ├── assets/
        │   └── hero.png      # Hero image
        │
        ├── components/
        │   ├── NoteForm.jsx      # Create note form with AI generate & auto-tag
        │   ├── NoteCard.jsx      # Note display card with actions
        │   ├── EditModal.jsx     # Edit note modal with AI rewrite
        │   ├── AIChatModal.jsx   # AI chat assistant modal
        │   ├── ShareModal.jsx    # Share link display modal
        │   └── Toast.jsx         # Toast notification component
        │
        └── pages/
            ├── Login.jsx         # Login page
            ├── Register.jsx      # Registration page
            ├── Notes.jsx         # Main notes dashboard
            ├── Profile.jsx       # User profile management
            └── SharedNote.jsx    # Public shared note view
```

---

## 📊 Database Schema

### Note Model
```javascript
{
  title:     String     // Required
  content:   String     // Required
  category:  String     // "Personal" | "Work" | "Study" (default: "Personal")
  tags:      [String]   // Array of lowercase tag strings
  isPublic:  Boolean    // Whether the note has a share link (default: false)
  shareId:   String     // UUID for public sharing (default: "")
  isPinned:  Boolean    // Pin to top (default: false)
  isTrashed: Boolean    // Soft delete (default: false)
  userId:    ObjectId   // Reference to User model (required)
  createdAt: Date       // Auto-generated timestamp
}
```

### User Model
```javascript
{
  username:  String   // Required, unique
  email:     String   // Required, unique
  password:  String   // Required (bcrypt hashed)
  createdAt: Date     // Auto-generated timestamp
}
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3500` | Server port |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `MONGODB_URI` | No | `mongodb://127.0.0.1:27017/notesdb` | MongoDB connection string |
| `SESSION_SECRET` | In Production | Random per-process (dev) | Session signing secret (min. 32 characters in production) |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key for AI features |

---

## 🔒 Security & Architecture Considerations

- **Session Storage:** Uses `express-session` with the default in-memory `MemoryStore`. Sessions reset upon server restart and do not persist across multi-instance clusters.
- **Session Secret:** In production (`NODE_ENV=production`), a `SESSION_SECRET` of at least 32 characters is enforced at server startup. In non-production environments, a random per-process secret is generated automatically if omitted.
- **CORS Configuration:** Configured for local development (`http://localhost:5173`) with credentials enabled.
- **Access Control:** `requireAuth` middleware verifies active user sessions; individual note modification routes rely on object ID lookups.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ using React, Express, MongoDB, and Google Gemini AI**

</div>
