const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherDashboard,
  getMyClasses,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

// Teacher Portal Routes
router.get('/dashboard', protect, authorize('teacher'), getTeacherDashboard);
router.get('/my-classes', protect, authorize('teacher'), getMyClasses);

// General Teacher Routes
router.get('/', protect, authorize('admin', 'teacher'), getTeachers);
router.get('/:id', protect, authorize('admin', 'teacher'), getTeacherById);

// Admin Only
router.post('/', protect, authorize('admin'), createTeacher);
router.put('/:id', protect, authorize('admin'), updateTeacher);
router.delete('/:id', protect, authorize('admin'), deleteTeacher);

module.exports = router;
