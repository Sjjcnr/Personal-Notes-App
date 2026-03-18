import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function SharedNote() {
  const { shareId } = useParams()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/public/${shareId}`)
        if (res.ok) {
          const data = await res.json()
          setNote(data)
        } else {
          setError('This note is no longer available or the link is invalid.')
        }
      } catch {
        setError('Failed to load shared note.')
      } finally {
        setLoading(false)
      }
    }
    fetchNote()
  }, [shareId])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading shared note...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-wrapper">
        <div className="shared-error">
          <div className="empty-icon">🔗</div>
          <h2>Note Not Found</h2>
          <p>{error}</p>
          <Link to="/register" className="btn btn-primary" style={{ marginTop: '20px' }}>
            📝 Create Your Own Notes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-wrapper">
      <div className="shared-header">
        <h2>📝 Shared Note</h2>
        <p>Shared by <strong>{note.author}</strong></p>
      </div>

      <div className="shared-card">
        <div className="shared-card-header">
          <h1>{note.title}</h1>
          <span className={`category-badge badge-${note.category.toLowerCase()}`}>{note.category}</span>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="shared-tags">
            {note.tags.map((tag, i) => (
              <span key={i} className="tag-chip">#{tag}</span>
            ))}
          </div>
        )}

        <div className="shared-content markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
        </div>

        <div className="shared-date">
          🕐 {formatDate(note.createdAt)}
        </div>
      </div>

      <div className="shared-footer">
        <p>Create and organize your own notes</p>
        <Link to="/register" className="btn btn-primary">✨ Get Started Free</Link>
      </div>
    </div>
  )
}

export default SharedNote
