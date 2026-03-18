import { useState, useEffect } from 'react'

function EditModal({ note, allTags, onSave, onClose }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [category, setCategory] = useState(note.category)
  const [tags, setTags] = useState(note.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)
  const [isTagging, setIsTagging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    onSave({ title: title.trim(), content: content.trim(), category, tags })
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose()
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag])
        setTagInput('')
      }
    }
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


  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal">
        <h2><span className="icon">✏️</span> Edit Note</h2>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
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
                    {isRewriting ? '...' : '✨ Pro'}
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
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>

        {/* Tags */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Tags
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
                <button type="button" className="tag-remove" onClick={() => setTags(tags.filter(t => t !== tag))}>×</button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                className="tag-input"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>💾 Save Changes</button>
        </div>
      </div>
    </div>
  )
}

export default EditModal
