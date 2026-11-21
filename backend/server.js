const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables with override
dotenv.config({ override: true });

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Dev logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder for file uploads if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'School Management System API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/teachers', require('./src/routes/teacherRoutes'));
app.use('/api', require('./src/routes/classSubjectRoutes'));
app.use('/api/admissions', require('./src/routes/admissionRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));
app.use('/api/homework', require('./src/routes/homeworkRoutes'));
app.use('/api/fees', require('./src/routes/feeRoutes'));
app.use('/api/timetable', require('./src/routes/timetableRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 School Management Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use.`);
    console.error(`   A previous backend instance or another application is using port ${PORT}.`);
    console.error(`   To free port ${PORT} in PowerShell, run:`);
    console.error(`     Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    console.error(`   Or change PORT in backend/.env (e.g. PORT=5002).\n`);
    process.exit(1);
  } else {
    console.error(`Server Error: ${err.message}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Error: ${err.message}`);
});
