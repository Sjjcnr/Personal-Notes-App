import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Notes from './pages/Notes'
import Profile from './pages/Profile'
import SharedNote from './pages/SharedNote'
import Toast from './components/Toast'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  // Apply theme on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const checkAuth = async () => {
    try {
      const res = await fetch('/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
      showToast('Logged out successfully')
    } catch {
      setUser(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} showToast={showToast} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register showToast={showToast} />}
        />
        <Route
          path="/"
          element={
            user
              ? <Notes user={user} onLogout={handleLogout} showToast={showToast} theme={theme} toggleTheme={toggleTheme} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile"
          element={
            user
              ? <Profile user={user} setUser={setUser} onLogout={handleLogout} showToast={showToast} theme={theme} toggleTheme={toggleTheme} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/shared/:shareId"
          element={<SharedNote />}
        />
      </Routes>
    </>
  )
}

export default App
