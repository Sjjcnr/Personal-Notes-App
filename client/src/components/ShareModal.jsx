import { useState, useEffect } from 'react'

function ShareModal({ note, onClose, showToast }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/shared/${note.shareId}`

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      showToast('Link copied to clipboard! 📋')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      showToast('Link copied to clipboard! 📋')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose()
  }

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal share-modal">
        <h2><span className="icon">🔗</span> Share Note</h2>

        <p className="share-note-title">"{note.title}"</p>
        <p className="share-description">Anyone with this link can view this note:</p>

        <div className="share-link-box">
          <input type="text" readOnly value={shareUrl} className="share-link-input" />
          <button className={`btn btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
