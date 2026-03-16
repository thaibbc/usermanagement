import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import { UserProvider } from "./context/UserContext";


function App() {
  return (
    <UserProvider>
      <Routes>
        {/* always start at the homepage */}
        <Route path="/" element={<Home />} />

        {/* authentication & user pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* application dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* admin dashboard */}
        <Route path="/users" element={<UserManagement />} />
        <Route path="/history" element={<UserManagement />} />

        {/* catch‑all redirects back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  )
}

export default App
