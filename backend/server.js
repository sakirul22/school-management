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

// Enable CORS with dynamic origin support (supports multiple origins, Vercel deployments, and local dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://schoolmanagement-vais3.vercel.app',
  'https://schoolmanagement-alpha-eosin.vercel.app',
];

if (process.env.CLIENT_URL) {
  // Support comma-separated URLs and automatically strip trailing slashes or '/api' paths
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const cleaned = url.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
    if (cleaned && !allowedOrigins.includes(cleaned)) {
      allowedOrigins.push(cleaned);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, curl, Postman, or requests without Origin header
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow explicitly listed origins, any localhost/127.0.0.1, or any *.vercel.app deployment
    const isAllowed =
      allowedOrigins.includes(cleanOrigin) ||
      /\.vercel\.app$/.test(cleanOrigin) ||
      /^http:\/\/localhost(:\d+)?$/.test(cleanOrigin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(cleanOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));

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
