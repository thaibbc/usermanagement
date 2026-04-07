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
import AssignmentDetail from './pages/AssignmentDetail'
import { UserProvider } from "./context/UserContext";
import QuestionBank, { QuestionBank as BankManagement } from './pages/QuestionBank'
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

        {/* Protected routes - yêu cầu đăng nhập */}
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

        {/* Routes cho học sinh */}
        <Route path="/student-class" element={
          <ProtectedRoute>
            <StudentClass />
          </ProtectedRoute>
        } />

        {/* Routes cho giáo viên và admin */}
        <Route path="/my-library" element={
          <ProtectedRoute requiredRole={['admin', 'teacher']}>
            <MyLibrary />
          </ProtectedRoute>
        } />

        {/* Routes cho giáo viên và admin (quản lý) */}
        <Route path="/classes" element={
          <ProtectedRoute requiredRole={['admin', 'teacher']}>
            <ClassManagement />
          </ProtectedRoute>
        } />

        <Route path="/question-bank" element={
          <ProtectedRoute requiredRole={['admin', 'teacher']}>
            <QuestionBank />
          </ProtectedRoute>
        } />

        <Route path="/bank-management" element={
          <ProtectedRoute requiredRole={['admin', 'teacher']}>
            <BankManagement />
          </ProtectedRoute>
        } />

        {/* ClassDetail - cho tất cả user đã đăng nhập */}
        <Route path="/classes/:classCode" element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        } />

        {/* AssignmentDetail - chi tiết bài tập */}
        <Route path="/classes/:classCode/assignments/:assignmentId" element={
          <ProtectedRoute>
            <AssignmentDetail />
          </ProtectedRoute>
        } />

        {/* Routes chỉ dành cho admin */}
        <Route path="/users" element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } />

        {/* User routes - đang phát triển */}
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