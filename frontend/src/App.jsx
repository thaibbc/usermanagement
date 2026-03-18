// App.jsx
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import ClassManagement from './pages/ClassManagement'
import { ClassDetail } from './pages/ClassDetail'
import { UserProvider } from "./context/UserContext";
import QuestionBank from './pages/QuestionBank'
import ProtectedRoute from './Components/ProtectedRoute'
import { StudentClass } from './pages/StudentClass';
import { MyLibrary } from './pages/MyLibrary';

function App() {
  return (
    <UserProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/users" element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } />

        <Route path="/classes" element={
          <ProtectedRoute requiredRole="admin">
            <ClassManagement />
          </ProtectedRoute>
        } />

        {/* ClassDetail - cho cả admin, teacher và student */}
        <Route path="/classes/:classCode" element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        } />

        <Route path="/my-library" element={
          <ProtectedRoute>
            <MyLibrary />
          </ProtectedRoute>
        } />

        <Route path="/student-class" element={
          <ProtectedRoute>
            <StudentClass />
          </ProtectedRoute>
        } />

        <Route path="/question-bank" element={
          <ProtectedRoute requiredRole="admin">
            <QuestionBank />
          </ProtectedRoute>
        } />

        {/* User routes */}
        <Route path="/my-classes" element={
          <ProtectedRoute>
            <div>Lớp học của tôi - Đang phát triển</div>
          </ProtectedRoute>
        } />

        <Route path="/assignments" element={
          <ProtectedRoute>
            <div>Bài tập - Đang phát triển</div>
          </ProtectedRoute>
        } />

        <Route path="/exam-rooms" element={
          <ProtectedRoute>
            <div>Phòng thi - Đang phát triển</div>
          </ProtectedRoute>
        } />

        <Route path="/support" element={
          <ProtectedRoute>
            <div>Hỗ trợ - Đang phát triển</div>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <div>Cài đặt - Đang phát triển</div>
          </ProtectedRoute>
        } />

        {/* History route */}
        <Route path="/history" element={
          <ProtectedRoute>
            <div>Lịch sử hoạt động - Đang phát triển</div>
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  )
}

export default App