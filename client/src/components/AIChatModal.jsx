import { useState, useEffect } from 'react'

function AIChatModal({ onClose }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose()
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    
    setLoading(true)
    setAnswer('')
    
    try {
      const res = await fetch('/notes/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      if (res.ok) {
        setAnswer(data.answer)
      } else {
        setAnswer('Error: ' + data.message)
      }
    } catch {
      setAnswer('Failed to connect to AI server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal ai-chat-modal">
        <h2><span className="icon">✨</span> Ask AI About Your Notes</h2>
        <p className="ai-description">The AI will read through all your personal notes to answer your question.</p>

        <form onSubmit={handleAsk} className="ai-chat-form">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              className="search-input" 
              placeholder="e.g. What is my wifi password? or Summarize my project ideas..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ position: 'absolute', right: '4px', padding: '10px 16px' }} disabled={loading || !question.trim()}>
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </form>

        {loading && (
           <div className="ai-response-box loading">
             <div className="loading-spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
             <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-secondary)' }}>Scanning your notes...</p>
           </div>
        )}

        {answer && !loading && (
          <div className="ai-response-box">
             <h4 style={{ marginBottom: '8px', color: 'var(--accent-primary)' }}>AI Response:</h4>
             <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{answer}</div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default AIChatModal
