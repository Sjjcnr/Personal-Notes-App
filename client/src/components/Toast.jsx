import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <span>{icons[type] || '✅'}</span> {message}
      </div>
    </div>
  )
}

export default Toast
