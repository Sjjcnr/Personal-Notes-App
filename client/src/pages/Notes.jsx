import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import NoteForm from '../components/NoteForm'
import EditModal from '../components/EditModal'
import ShareModal from '../components/ShareModal'
import AIChatModal from '../components/AIChatModal'

function Notes({ user, onLogout, showToast, theme, toggleTheme }) {
  const [notes, setNotes] = useState([])
  const [editingNote, setEditingNote] = useState(null)
  const [shareNote, setShareNote] = useState(null)
  const [showAIChat, setShowAIChat] = useState(false)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTag, setActiveTag] = useState('')
  const [allTags, setAllTags] = useState([])

  const categories = ['All', 'Personal', 'Work', 'Study']

  const fetchNotes = async () => {
    try {
      const res = await fetch('/notes', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        data.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return b.isPinned ? 1 : -1;
          }
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        setNotes(data)
      }
    } catch {
      showToast('Failed to load notes', 'error')
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/notes/tags', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAllTags(data)
      }
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchNotes()
    fetchTags()
  }, [])

  const addNote = async (noteData) => {
    try {
      const res = await fetch('/notes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(noteData)
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Note added successfully! 🎉')
        fetchNotes()
        fetchTags()
      } else {
        showToast(data.message, 'error')
      }
    } catch {
      showToast('Failed to add note', 'error')
    }
  }

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    try {
      const res = await fetch(`/notes/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        showToast('Note deleted successfully')
        fetchNotes()
        fetchTags()
      }
    } catch {
      showToast('Failed to delete note', 'error')
    }
  }

  const updateNote = async (id, noteData) => {
    try {
      const res = await fetch(`/notes/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(noteData)
      })
      if (res.ok) {
        showToast('Note updated successfully! ✏️')
        setEditingNote(null)
        fetchNotes()
        fetchTags()
      }
    } catch {
      showToast('Failed to update note', 'error')
    }
  }

  const toggleShare = async (note) => {
    try {
      const res = await fetch(`/notes/share/${note._id}`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        if (data.note.isPublic) {
          setShareNote(data.note)
        } else {
          showToast('Note link removed')
        }
        fetchNotes()
      }
    } catch {
      showToast('Failed to share note', 'error')
    }
  }

  const toggleTrash = async (note) => {
    try {
      const res = await fetch(`/notes/update/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isTrashed: !note.isTrashed })
      })
      if (res.ok) {
        showToast(note.isTrashed ? 'Note restored! ♻️' : 'Note moved to trash 🗑️')
        fetchNotes()
      }
    } catch {
      showToast('Action failed', 'error')
    }
  }

  const togglePin = async (note) => {
    try {
      const res = await fetch(`/notes/update/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPinned: !note.isPinned })
      })
      if (res.ok) {
        fetchNotes()
      }
    } catch {
      // ignore
    }
  }

  // Filter notes
  const [viewMode, setViewMode] = useState('active')

  const filteredNotes = notes.filter(note => {
    const isNoteTrashed = note.isTrashed || false;
    if (viewMode === 'active' && isNoteTrashed) return false;
    if (viewMode === 'trash' && !isNoteTrashed) return false;

    const matchesSearch = searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some(t => t.includes(searchQuery.toLowerCase())))

    const matchesCategory = activeCategory === 'All' || note.category === activeCategory

    const matchesTag = activeTag === '' || (note.tags && note.tags.includes(activeTag))

    return matchesSearch && matchesCategory && matchesTag
  })

  const clearFilters = () => {
    setSearchQuery('')
    setActiveCategory('All')
    setActiveTag('')
  }

  const hasActiveFilters = searchQuery || activeCategory !== 'All' || activeTag

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="user-info">
          <Link to="/profile" className="user-avatar-link" title="Profile">
            <span className="user-avatar">{user.username[0].toUpperCase()}</span>
          </Link>
          <span className="user-name">{user.username}</span>
        </div>
        <div className="top-bar-actions">
          <button className="btn-theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/profile" className="btn btn-profile">👤 Profile</Link>
          <button className="btn btn-signout" onClick={onLogout}>🚪 Sign Out</button>
        </div>
      </div>

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <h1>📝 Personal Notes</h1>
          <p>Capture your thoughts, organize your ideas</p>
        </header>

        {/* Note Form */}
        <NoteForm onAdd={addNote} allTags={allTags} />

        {/* Search & Filter */}
        <div className="search-filter-section">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div className="search-bar-wrapper" style={{ flex: 1, marginBottom: 0 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search notes by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {hasActiveFilters && (
                <button className="btn-clear-search" onClick={clearFilters}>✕</button>
              )}
            </div>
            <button className="btn btn-primary" onClick={() => setShowAIChat(true)}>✨ Ask AI</button>
          </div>

          <div className="filter-pills">
            <button
              className={`filter-pill ${viewMode === 'active' ? 'active' : ''}`}
              onClick={() => { setViewMode('active'); setActiveCategory('All'); }}
            >
              📝 Active Notes
            </button>
            <button
              className={`filter-pill ${viewMode === 'trash' ? 'active' : ''}`}
              onClick={() => { setViewMode('trash'); setActiveCategory('All'); }}
            >
              🗑️ Trash
            </button>
            
            <span className="filter-divider">|</span>

            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-pill ${activeCategory === cat && viewMode === 'active' ? 'active' : ''}`}
                onClick={() => { setViewMode('active'); setActiveCategory(cat); }}
              >
                {cat}
              </button>
            ))}

            {allTags.length > 0 && (
              <>
                <span className="filter-divider">|</span>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`filter-pill filter-pill-tag ${activeTag === tag ? 'active' : ''}`}
                    onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        <section className="notes-section">
          <div className="notes-section-header">
            <h2><span className="icon">📋</span> Your Notes</h2>
            <span className="note-count">
              {filteredNotes.length}{hasActiveFilters ? ` / ${notes.length}` : ''} note{filteredNotes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="notes-grid">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{hasActiveFilters ? '🔎' : '📭'}</div>
                <h3>{hasActiveFilters ? 'No matching notes' : 'No notes yet'}</h3>
                <p>{hasActiveFilters ? 'Try different search terms or filters' : 'Create your first note using the form above!'}</p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={clearFilters} style={{ marginTop: '16px' }}>Clear Filters</button>
                )}
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  index={index}
                  viewMode={viewMode}
                  onEdit={() => setEditingNote(note)}
                  onDelete={() => deleteNote(note._id)}
                  onToggleTrash={() => toggleTrash(note)}
                  onTogglePin={() => togglePin(note)}
                  onShare={() => toggleShare(note)}
                  onTagClick={(tag) => { setActiveTag(tag); setActiveCategory('All'); setViewMode('active'); }}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {editingNote && (
        <EditModal
          note={editingNote}
          allTags={allTags}
          onSave={(data) => updateNote(editingNote._id, data)}
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Share Modal */}
      {shareNote && (
        <ShareModal
          note={shareNote}
          onClose={() => setShareNote(null)}
          showToast={showToast}
        />
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIChatModal onClose={() => setShowAIChat(false)} />
      )}
    </>
  )
}

export default Notes
