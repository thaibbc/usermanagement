import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserManagement />} />
      <Route path="/history" element={<UserManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
