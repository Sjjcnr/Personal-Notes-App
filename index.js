require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const NoteModel = require('./models/noteModel');
const UserModel = require('./models/userModel');
const genAI = require('./config/gemini');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(session({
    secret: 'personal-notes-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const PORT = process.env.PORT || 3500;
app.listen(PORT, async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/notesdb";
        await mongoose.connect(MONGODB_URI);
        console.log(`Connected to MongoDB: ${MONGODB_URI.includes('127.0.0.1') ? 'Local Database' : 'Cloud Atlas'}`);
    } catch (err) {
        console.log("Error connecting to MongoDB:", err);
    }
    console.log(`Server is running on port ${PORT}`);
});

// =============================================
// AUTH ROUTES
// =============================================

// POST /auth/register
app.post("/auth/register", async (req, res) => {
    try {
        let { username, email, password } = req.body;

        let existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        let existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        let newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Registration successful! Please login." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        let user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ message: "Login successful!", username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /auth/me
app.get("/auth/me", async (req, res) => {
    try {
        if (req.session.userId) {
            res.json({ userId: req.session.userId, username: req.session.username });
        } else {
            res.status(401).json({ message: "Not logged in" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /auth/logout
app.post("/auth/logout", async (req, res) => {
    try {
        req.session.destroy();
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /auth/profile — get full user profile
app.get("/auth/profile", requireAuth, async (req, res) => {
    try {
        let user = await UserModel.findById(req.session.userId).select('-password');
        let notesCount = await NoteModel.countDocuments({ userId: req.session.userId });
        res.json({
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            notesCount: notesCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /auth/profile/update — update username/email
app.put("/auth/profile/update", requireAuth, async (req, res) => {
    try {
        let { username, email } = req.body;
        let userId = req.session.userId;

        // Check if new username is taken by another user
        let existingUsername = await UserModel.findOne({ username, _id: { $ne: userId } });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Check if new email is taken by another user
        let existingEmail = await UserModel.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already registered" });
        }

        let updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true }
        ).select('-password');

        req.session.username = updatedUser.username;
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /auth/password/change — change password
app.put("/auth/password/change", requireAuth, async (req, res) => {
    try {
        let { currentPassword, newPassword } = req.body;
        let user = await UserModel.findById(req.session.userId);

        let isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);

        await UserModel.findByIdAndUpdate(req.session.userId, { password: hashedPassword });
        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// AUTH MIDDLEWARE
// =============================================
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: "Please login first" });
    }
}

// =============================================
// NOTES ROUTES (all protected)
// =============================================

// POST /notes/add
app.post("/notes/add", requireAuth, async (req, res) => {
    try {
        let note = req.body;
        note.userId = req.session.userId;
        if (note.tags && typeof note.tags === 'string') {
            note.tags = note.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        }
        let newNote = new NoteModel(note);
        await newNote.save();
        res.json({ message: "Note added successfully", note: newNote });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /notes
app.get("/notes", requireAuth, async (req, res) => {
    try {
        let notes = await NoteModel.find({ userId: req.session.userId });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /notes/tags — get unique tags for the user
app.get("/notes/tags", requireAuth, async (req, res) => {
    try {
        let tags = await NoteModel.distinct("tags", { userId: req.session.userId });
        res.json(tags);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /notes/:id
app.get("/notes/:id", requireAuth, async (req, res) => {
    try {
        let id = req.params.id;
        let note = await NoteModel.findById(id);
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /notes/update/:id
app.put("/notes/update/:id", requireAuth, async (req, res) => {
    try {
        let id = req.params.id;
        let updateData = req.body;
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        }
        let updatedNote = await NoteModel.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /notes/delete/:id
app.delete("/notes/delete/:id", requireAuth, async (req, res) => {
    try {
        let id = req.params.id;
        await NoteModel.findByIdAndDelete(id);
        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /notes/share/:id — toggle sharing
app.post("/notes/share/:id", requireAuth, async (req, res) => {
    try {
        let id = req.params.id;
        let note = await NoteModel.findById(id);

        if (!note || note.userId.toString() !== req.session.userId) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (note.isPublic) {
            // Unshare
            note.isPublic = false;
            note.shareId = "";
        } else {
            // Share
            note.isPublic = true;
            note.shareId = uuidv4();
        }

        await note.save();
        res.json({ message: note.isPublic ? "Note shared!" : "Note unshared", note });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /notes/public/:shareId — view a shared note (NO auth required)
app.get("/public/:shareId", async (req, res) => {
    try {
        let shareId = req.params.shareId;
        let note = await NoteModel.findOne({ shareId, isPublic: true });

        if (!note) {
            return res.status(404).json({ message: "Shared note not found or no longer public" });
        }

        // Get author username
        let author = await UserModel.findById(note.userId).select('username');
        res.json({
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            createdAt: note.createdAt,
            author: author ? author.username : 'Unknown'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// AI MAGIC ROUTES
// =============================================

// POST /notes/ai/rewrite - Polish and rewrite note content
app.post("/notes/ai/rewrite", requireAuth, async (req, res) => {
    try {
        const { title, content, style } = req.body;
        if (!content) return res.status(400).json({ message: "Content is required for AI rewrite." });
        
        let promptModifier = "Fix grammar and improve readability."; // Default
        if (style === 'professional') promptModifier = "Make the tone highly professional, concise, and structured.";
        if (style === 'casual') promptModifier = "Make the tone friendly, casual, and easy to read.";
        if (style === 'expand') promptModifier = "Expand on the ideas, making it longer and more detailed.";
        if (style === 'summarize') promptModifier = "Summarize the key points in a bulleted list.";

        const prompt = `You are an expert writing assistant. Your task is to rewrite the following note.
        ${promptModifier}
        
        Original Title: ${title || 'Untitled'}
        Original Content: ${content}

        Return the response EXACTLY in this JSON format (no markdown, no backticks, just raw JSON that can be parsed by JSON.parse):
        {
          "title": "Improved Title (if applicable, else original)",
          "content": "The newly polished and rewritten content here..."
        }`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean up markdown around JSON if Gemini accidentally includes it
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        const improvedNote = JSON.parse(text);
        res.json(improvedNote);
    } catch (err) {
        console.error("AI Rewrite Error:", err);
        res.status(500).json({ message: "Failed to rewrite note. Please try again." });
    }
});

// POST /notes/ai/auto-tag - Automatically categorize and tag notes
app.post("/notes/ai/auto-tag", requireAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!content) return res.status(400).json({ message: "Content is required for AI tagging." });

        const prompt = `You are an AI organizing assistant. Read the note below and determine the best category and up to 5 relevant short tags.
        Categories MUST be exactly one of: "Personal", "Work", or "Study".
        Tags should be short, one-word, lowercase keywords without the hashtag.
        
        Title: ${title || 'Untitled'}
        Content: ${content}

        Return the response EXACTLY in this JSON format (no markdown, no backticks, just raw JSON that can be parsed by JSON.parse):
        {
          "category": "Work",
          "tags": ["project", "deadline", "meeting"]
        }`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        let tagData;
        try {
            tagData = JSON.parse(text);
        } catch (e) {
            // Fallback if parsing fails because Gemini sometimes adds formatting anyway
            tagData = { category: "Personal", tags: ["ai"] };
        }

        // Validate category
        if (!['Personal', 'Work', 'Study'].includes(tagData.category)) {
            tagData.category = "Personal";
        }

        res.json(tagData);
    } catch (err) {
        console.error("AI Tagging Error:", err);
        res.status(500).json({ message: "Failed to generate tags." });
    }
});

// POST /notes/ai/chat - Chat with ALL user's notes
app.post("/notes/ai/chat", requireAuth, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: "Please ask a question." });

        // Retrieve all user notes directly from database to give as context
        const notes = await NoteModel.find({ userId: req.session.userId });
        
        if (notes.length === 0) {
            return res.json({ answer: "You don't have any notes yet! Create some notes before asking me questions." });
        }

        // Condense notes into a readable context
        const notesContext = notes.map(n => `Title: ${n.title}\nCategory: ${n.category}\nDate: ${new Date(n.createdAt).toDateString()}\nTags: ${n.tags.join(',')}\nContent: ${n.content}\n---`).join('\n');

        const prompt = `You are a helpful and intelligent Personal Assistant. Your job is to answer the user's question STRICTLY based on the context of their personal notes provided below.
        
        Rules:
        1. Answer directly and concisely.
        2. If the user's notes do not contain the answer, politely say "I couldn't find anything related to that in your notes." Do not make up information.
        3. Use a helpful, conversational tone and use markdown for bolding/bullet points if relevant.
        
        User's Question: "${question}"
        
        --- USER'S NOTES CONTEXT ---
        ${notesContext}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        res.json({ answer });
    } catch (err) {
        console.error("AI Chat Error:", err);
        res.status(500).json({ message: "AI Chat failed to respond." });
    }
});

// POST /notes/ai/generate - Automatically generate note content from title
app.post("/notes/ai/generate", requireAuth, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: "Please enter a title first." });

        const prompt = `You are a helpful content writing assistant. Please write a well-structured, insightful, and concise note about the following topic:
        Topic/Title: "${title}"
        
        Write clearly and use markdown formatting (like bullet points and bold text) if it makes the note easier to read.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        res.json({ content: answer });
    } catch (err) {
        console.error("AI Generation Error:", err);
    }
});

// =============================================
// DEPLOYMENT STATIC FILES
// =============================================
// Serve the React frontend locally or in production
app.use(express.static(path.join(__dirname, 'client/dist')));

// Catch-all route to hand over routing to React Router
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/notes') && !req.path.startsWith('/auth')) {
        res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
    } else {
        next();
    }
});
 
