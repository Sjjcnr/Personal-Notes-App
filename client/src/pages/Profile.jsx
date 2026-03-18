import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Profile({ user, setUser, onLogout, showToast, theme, toggleTheme }) {
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await fetch('/auth/profile', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setUsername(data.username)
        setEmail(data.email)
      }
    } catch {
      showToast('Failed to load profile', 'error')
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim()) {
      showToast('Please fill in all fields', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/auth/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), email: email.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Profile updated! ✨')
        setUser({ ...user, username: username.trim() })
        fetchProfile()
      } else {
        showToast(data.message, 'error')
      }
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error')
      return
    }
    setChangingPw(true)
    try {
      const res = await fetch('/auth/password/change', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Password changed successfully! 🔒')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showToast(data.message, 'error')
      }
    } catch {
      showToast('Failed to change password', 'error')
    } finally {
      setChangingPw(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  if (!profile) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="user-info">
          <Link to="/" className="user-avatar-link" title="Back to Notes">
            <span className="user-avatar">{profile.username[0].toUpperCase()}</span>
          </Link>
          <span className="user-name">{profile.username}</span>
        </div>
        <div className="top-bar-actions">
          <button className="btn-theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/" className="btn btn-profile">📝 Notes</Link>
          <button className="btn btn-signout" onClick={onLogout}>🚪 Sign Out</button>
        </div>
      </div>

      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-hero">
          <div className="profile-avatar-large">{profile.username[0].toUpperCase()}</div>
          <h1>{profile.username}</h1>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile.notesCount}</span>
              <span className="stat-label">Notes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatDate(profile.createdAt)}</span>
              <span className="stat-label">Member Since</span>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="profile-card">
          <h2>✏️ Edit Profile</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h2>🔒 Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={changingPw}>
              {changingPw ? '⏳ Changing...' : '🔐 Update Password'}
            </button>
          </form>
        </div>

        <Link to="/" className="btn btn-back-notes">← Back to Notes</Link>
      </div>
    </>
  )
}

export default Profile
