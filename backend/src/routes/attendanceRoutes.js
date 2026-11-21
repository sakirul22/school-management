const express = require('express');
const router = express.Router();
const {
  getClassAttendance,
  saveClassAttendance,
  getMyAttendance,
  getTeacherAttendance,
  saveTeacherAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Student own attendance
router.get('/my-attendance', protect, authorize('student'), getMyAttendance);

// Class attendance
router.get('/class', protect, authorize('admin', 'teacher'), getClassAttendance);
router.post('/class', protect, authorize('admin', 'teacher'), saveClassAttendance);

// Teacher attendance
router.get('/teacher', protect, authorize('admin'), getTeacherAttendance);
router.post('/teacher', protect, authorize('admin'), saveTeacherAttendance);

module.exports = router;
