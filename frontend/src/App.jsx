import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <Routes>
      {/* always start at the homepage */}
      <Route path="/" element={<Home />} />

      {/* authentication & user pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />

      {/* admin dashboard */}
      <Route path="/users" element={<UserManagement />} />
      <Route path="/history" element={<UserManagement />} />

      {/* catch‑all redirects back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
