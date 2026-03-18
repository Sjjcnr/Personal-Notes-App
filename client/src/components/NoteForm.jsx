import { useState } from 'react'

function NoteForm({ onAdd, allTags }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Personal')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const [isRewriting, setIsRewriting] = useState(false)
  const [isTagging, setIsTagging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleRewrite = async (style = 'default') => {
    if (!content.trim()) return;
    setIsRewriting(true);
    try {
      const res = await fetch('/notes/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, style })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.title) setTitle(data.title);
        if (data.content) setContent(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleAutoTag = async () => {
    if (!content.trim()) return;
    setIsTagging(true);
    try {
      const res = await fetch('/notes/ai/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.category) setCategory(data.category);
        if (data.tags) {
          const uniqueTags = Array.from(new Set([...tags, ...data.tags])).slice(0, 5);
          setTags(uniqueTags);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTagging(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/notes/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setContent(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    onAdd({ title: title.trim(), content: content.trim(), category, tags })
    setTitle('')
    setContent('')
    setCategory('Personal')
    setTags([])
    setTagInput('')
  }

  const filteredSuggestions = allTags.filter(t =>
    t.includes(tagInput.toLowerCase()) && !tags.includes(t)
  )

  return (
    <section className="note-form-section">
      <h2><span className="icon">✏️</span> Create a New Note</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Content
              <div style={{ display: 'flex', gap: '8px' }}>

                {title.trim() && (
                  <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={handleGenerateContent} disabled={isGenerating}>
                    {isGenerating ? '...' : (content.trim() ? '🤖 Complete with AI' : '🤖 Write with AI')}
                  </button>
                )}
                {content.trim() && (
                  <>
                    <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={() => handleRewrite('professional')} disabled={isRewriting}>
                      {isRewriting ? '...' : '✨ Make Professional'}
                    </button>
                    <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={() => handleRewrite('summarize')} disabled={isRewriting}>
                      {isRewriting ? '...' : '✨ Summarize'}
                    </button>
                    <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={() => handleRewrite()} disabled={isRewriting}>
                      {isRewriting ? '...' : '✨ Fix Grammar'}
                    </button>
                  </>
                )}
              </div>
            </label>
            <textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Tags Input */}
          <div className="form-group full-width">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tags <span className="label-hint">(max 5, press Enter to add)</span></span>
              {content.trim() && (
                <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }} onClick={handleAutoTag} disabled={isTagging}>
                  {isTagging ? '...' : '🏷️ Auto-Categorize & Tag'}
                </button>
              )}
            </label>
            <div className="tag-input-wrapper">
              {tags.map((tag, i) => (
                <span key={i} className="tag-chip editable">
                  #{tag}
                  <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              {tags.length < 5 && (
                <div className="tag-input-container">
                  <input
                    type="text"
                    className="tag-input"
                    placeholder={tags.length === 0 ? "Add a tag..." : ""}
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true) }}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && tagInput && filteredSuggestions.length > 0 && (
                    <div className="tag-suggestions">
                      {filteredSuggestions.slice(0, 5).map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          className="tag-suggestion-item"
                          onClick={() => { setTags([...tags, s]); setTagInput(''); setShowSuggestions(false) }}
                        >
                          #{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
        <button type="submit" className="btn btn-primary">🚀 Add Note</button>
      </form>
    </section>
  )
}

export default NoteForm
