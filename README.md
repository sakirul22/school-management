# 🏫 Complete School Management System (MERN Stack)

A modern, responsive, full-stack **School Management System** built with MongoDB, Express.js, React.js (Vite), and Node.js. The platform features three distinct role-based portals for **Admin**, **Teacher**, and **Student**, complete with JWT authentication, role authorization, CRUD operations, Recharts analytics, and realistic Indian dummy data.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Authentication & Authorization
- **Unified Login Page**: Supports Admin, Teacher, and Student login with secure password hashing (`bcryptjs`) and JWT token handling.
- **1-Click Demo Buttons**: Quick pre-filled demo account buttons for seamless testing.
- **Route Protection**: Frontend `ProtectedRoute` and backend Express middleware (`protect` and `authorize`).
- **Role-based Redirection**:
  - Admin ➔ `/admin/dashboard`
  - Teacher ➔ `/teacher/dashboard`
  - Student ➔ `/student/dashboard`

---

### 2. 🏛️ Admin Portal
- **Dashboard Overview**:
  - 8 Summary Cards: Total Students, Total Teachers, Total Classes, Total Admissions, Fees Collected, Pending Fees, Today's Attendance %, Active Homework.
  - 4 Dynamic Recharts:
    - *Monthly Fee Collection* (Bar Chart: Collected vs Pending in ₹ INR)
    - *Student Attendance Trend* (Line Chart: Daily Present % vs Absent %)
    - *Class-wise Student Distribution* (Bar Chart: Enrolled counts by grade)
    - *Admission Applications Status* (Donut Chart: Pending, Approved, Rejected)
  - Live activity feed & upcoming academic calendar events.
- **Student Management**:
  - Full CRUD operations with auto-generated admission numbers (`ADM-2026-XXXX`).
  - Search by student name, roll number, or admission number.
  - Filters by class standard, section, and enrollment status.
  - Detailed student profile view and CSV export.
- **Admission Management**:
  - Application intake pipeline with status badges (Pending, Approved, Rejected).
  - One-click approval workflow that **automatically generates student records and portal login credentials**.
  - Section allocation and rejection handling with remarks.
- **Faculty & Teacher Management**:
  - Add, edit, deactivate, or delete faculty members.
  - Assign subjects and classes to teachers.
  - Comprehensive teacher profile view and payroll salary overview.
- **Class & Subject Management**:
  - Standards management (Class 6 through Class 10).
  - Multiple sections (Section A, B, C) with room numbers and student capacity.
  - Curriculum subjects with codes and instructor assignments.
  - Interactive class roster viewer.
- **Fee & Payment Management**:
  - Set class-wise fee structures (Tuition, Admission, Exam, Transport, Late fine).
  - Record manual offline/online payments (Cash, UPI, Bank Transfer, Cheque).
  - Track Paid, Unpaid, Partial, and Overdue student fee balances.
  - Disciplinary fines module (Library overdue, lab damage).
  - **Official Printable Payment Receipts**: Branded receipt modal with school header, student breakdown, "PAID" verification stamp, and Print/PDF export.
- **Attendance Monitoring**:
  - Daily roll-call inspection for students and faculty.
  - Filter by class standard, section, and calendar date.
  - Summary metrics and one-click CSV export.
- **Master Timetable Management**:
  - Weekly instructional grid (Monday through Saturday).
  - Assign period numbers, timings, subjects, instructors, and rooms.
- **Notice Board Management**:
  - Publish notices targeted to all school, faculty only, or students/specific classes.
  - Priority levels (High, Medium, Low) and categories (Exam, Holiday, Sports, Academic).
- **Reports & Data Export**:
  - Audit-ready reports for Students, Teachers, Attendance, Fee Collections, Pending Dues, and Admissions.
  - Direct CSV downloads and printable layouts.

---

### 3. 👩‍🏫 Teacher Portal
- **Teacher Dashboard**:
  - Assigned class counts, total students under instruction, today's schedule, attendance status, and pending homework reviews.
  - Today's instructional period timetable snippet.
- **My Classes**:
  - Assigned standards and subjects overview.
  - Student roster with quick search and student profile modals.
- **Student Attendance Register**:
  - Class and section roll call.
  - Toggle buttons for *Present*, *Absent*, and *Late*.
  - "Mark All Present" shortcut.
  - Upsert mechanism preventing duplicate attendance records.
- **Homework Management**:
  - Create assignments with title, description, deadline, and reference document URLs.
  - View submission status of enrolled students.
  - **Evaluation & Feedback**: Review submitted answers, assign marks (e.g. 92/100), write feedback, and mark as *Reviewed*.
- **Timetable & Notices**:
  - Personalized weekly schedule of teaching periods.
  - Faculty circulars and administrative notices.

---

### 4. 🎓 Student Portal
- **Student Dashboard**:
  - Profile identity card with admission number, class, section, and roll number.
  - Overall attendance percentage badge.
  - Pending homework assignments counter.
  - Fee clearance status badge.
  - Today's lecture schedule and campus circulars.
- **My Profile**:
  - Full academic record (read-only for security), parent/guardian contact, blood group, and previous school.
- **My Attendance**:
  - 30-day daily roll-call log.
  - Present, Absent, and Late breakdown with compliance rate.
- **Homework & Submissions**:
  - Assigned homework with subject filters and deadline indicators.
  - Submission modal to input answer text or document links.
  - View teacher marks and written feedback after grading.
- **Fees & Payments**:
  - Invoices breakdown (Tuition, Exam, Lab charges).
  - Payment history with instant access to view and print official receipts.
  - Applicable fine notifications.
- **Timetable & Notices**:
  - Class weekly timetable with timings and instructors.
  - Examination datesheets, sports day notices, and holiday announcements.

---

## 💻 Tech Stack

- **Frontend**: React 19 (Vite), React Router DOM 7, Tailwind CSS, Lucide React, Recharts, Axios
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, Cookie-Parser, Morgan, CORS
- **Database**: MongoDB (Atlas or Local MongoDB `mongodb://127.0.0.1:27017/school_management`)

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Admin (Principal)** | `admin@school.com` | `Admin@123` | `/admin/dashboard` |
| **Teacher (Faculty)** | `teacher@school.com` | `Teacher@123` | `/teacher/dashboard` |
| **Student (Class 10-A)** | `student@school.com` | `Student@123` | `/student/dashboard` |

> *Tip: You can click the 1-Click Demo buttons on the login page to immediately fill the credentials!*

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas cluster)

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create or verify `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/school_management
JWT_SECRET=super_secret_jwt_key_school_mgmt_2026_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Seed the database with realistic school data:
```bash
npm run seed
```

Start the backend server:
```bash
npm start
# Server runs on http://localhost:5001
```

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create or verify `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the frontend development server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser to access the application.

---

## 📡 API Overview

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get authenticated user profile
- `POST /api/auth/forgot-password` - Password recovery request

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard summary counts & Recharts dataset
- `GET /api/students` - Query students with search, filters & pagination
- `POST /api/students` - Add student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Deactivate/Delete student
- `GET /api/teachers` - Query teachers
- `POST /api/teachers` - Add faculty member
- `GET /api/admissions` - Admission applications list
- `PUT /api/admissions/:id/approve` - Approve admission and enroll student
- `PUT /api/admissions/:id/reject` - Reject admission
- `GET /api/classes`, `POST /api/classes` - Standards CRUD
- `GET /api/sections`, `POST /api/sections` - Sections CRUD
- `GET /api/subjects`, `POST /api/subjects` - Curriculum subjects CRUD
- `GET /api/fees/structures`, `POST /api/fees/structures` - Fee schedules
- `GET /api/fees/student-fees` - Student fee status records
- `POST /api/fees/record-payment` - Record manual payment & issue receipt
- `GET /api/fees/receipt/:id` - Fetch receipt details
- `GET /api/fees/fines`, `POST /api/fees/fines` - Fines management
- `GET /api/reports` - Audit reports (students, teachers, attendance, fees, dues, admissions)

### Teacher Endpoints
- `GET /api/teachers/dashboard` - Teacher summary statistics
- `GET /api/teachers/my-classes` - Assigned classes & student rosters
- `GET /api/attendance/class` - Class attendance register
- `POST /api/attendance/class` - Save/Update class attendance
- `GET /api/homework` - Teacher assignments
- `POST /api/homework` - Create homework
- `GET /api/homework/:id/submissions` - Submissions review list
- `PUT /api/homework/submissions/:id/evaluate` - Grade and evaluate submission
- `GET /api/timetable/teacher` - Weekly teaching schedule

### Student Endpoints
- `GET /api/students/me` - Student personal profile
- `GET /api/attendance/my-attendance` - Attendance history & summary %
- `GET /api/homework/student` - Homework list with submission status
- `POST /api/homework/student/submit` - Submit homework work/attachment
- `GET /api/fees/my-fees` - Fee summary, invoices, receipts, and fines
- `GET /api/timetable/student` - Class timetable
- `GET /api/announcements` - Circulars & announcements
