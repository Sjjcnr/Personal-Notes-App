const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "Personal" },
    tags: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, default: "" },
    isPinned: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    createdAt: { type: Date, default: Date.now }
});
const NoteModel = mongoose.model("note", noteSchema);

module.exports = NoteModel;
