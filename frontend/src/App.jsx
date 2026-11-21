import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import AdmissionManagement from './pages/admin/AdmissionManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import ClassManagement from './pages/admin/ClassManagement';
import FeeManagement from './pages/admin/FeeManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import TimetableManagement from './pages/admin/TimetableManagement';
import NoticeManagement from './pages/admin/NoticeManagement';
import ReportsManagement from './pages/admin/ReportsManagement';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MyClasses from './pages/teacher/MyClasses';
import MarkAttendance from './pages/teacher/MarkAttendance';
import HomeworkManagement from './pages/teacher/HomeworkManagement';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TeacherNotices from './pages/teacher/TeacherNotices';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentHomework from './pages/student/StudentHomework';
import StudentFees from './pages/student/StudentFees';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentNotices from './pages/student/StudentNotices';

// Root Redirect component based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="admissions" element={<AdmissionManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />
            <Route path="notices" element={<NoticeManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
          </Route>

          {/* Teacher Portal Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<MyClasses />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="homework" element={<HomeworkManagement />} />
            <Route path="timetable" element={<TeacherTimetable />} />
            <Route path="notices" element={<TeacherNotices />} />
          </Route>

          {/* Student Portal Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="homework" element={<StudentHomework />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="notices" element={<StudentNotices />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
