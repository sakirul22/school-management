const express = require('express');
const router = express.Router();
const {
  getClassTimetable,
  saveDayTimetable,
  getTeacherTimetable,
  getStudentTimetable,
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/class', protect, getClassTimetable);
router.post('/day', protect, authorize('admin'), saveDayTimetable);
router.get('/teacher', protect, authorize('teacher'), getTeacherTimetable);
router.get('/student', protect, authorize('student'), getStudentTimetable);

module.exports = router;
