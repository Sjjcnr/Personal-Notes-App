import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function NoteCard({ note, index, viewMode, onEdit, onDelete, onToggleTrash, onTogglePin, onShare, onTagClick }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBadgeClass = (category) => {
    const map = { Personal: 'badge-personal', Work: 'badge-work', Study: 'badge-study' }
    return map[category] || 'badge-personal'
  }

  return (
    <div className="note-card" style={{ animationDelay: `${index * 0.05}s`, opacity: note.isTrashed ? 0.7 : 1 }}>
      <div className="note-card-header">
        <h3 className="note-card-title">
          {note.isPinned && <span title="Pinned" style={{ marginRight: '8px', cursor: 'pointer' }} onClick={onTogglePin}>📌</span>}
          {!note.isPinned && viewMode !== 'trash' && <span title="Pin" style={{ marginRight: '8px', cursor: 'pointer', opacity: 0.3 }} onClick={onTogglePin}>📌</span>}
          {note.title}
        </h3>
        <div className="note-card-badges">
          <span className={`category-badge ${getBadgeClass(note.category)}`}>{note.category}</span>
          {note.isPublic && <span className="shared-badge">🔗</span>}
        </div>
      </div>

      <div className="note-card-content markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-card-tags">
          {note.tags.map((tag, i) => (
            <button key={i} className="tag-chip small" onClick={() => onTagClick && onTagClick(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="note-card-footer">
        <span className="note-date">🕐 {formatDate(note.createdAt)}</span>
        <div className="note-actions">
          {viewMode === 'trash' ? (
            <>
              <button className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', border: '1px solid rgba(16, 185, 129, 0.2)' }} onClick={onToggleTrash} title="Restore">♻️</button>
              <button className="btn-icon btn-delete" onClick={onDelete} title="Permanently Delete">🔥</button>
            </>
          ) : (
            <>
              <button className="btn-icon" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => {
                const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
                a.click();
              }} title="Download Markdown">⬇️</button>
              <button className="btn-icon btn-share" onClick={onShare} title={note.isPublic ? "Unshare" : "Share"}>🔗</button>
              <button className="btn-icon btn-edit" onClick={onEdit} title="Edit">✏️</button>
              <button className="btn-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(244, 63, 94, 0.2)' }} onClick={onToggleTrash} title="Move to Trash">🗑️</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteCard
