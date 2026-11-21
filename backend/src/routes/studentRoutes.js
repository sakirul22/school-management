const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Student personal profile
router.get('/me', protect, authorize('student'), getMyProfile);

// Admin & Teacher can query students
router.get('/', protect, authorize('admin', 'teacher'), getStudents);
router.get('/:id', protect, authorize('admin', 'teacher'), getStudentById);

// Admin only operations
router.post('/', protect, authorize('admin'), createStudent);
router.put('/:id', protect, authorize('admin'), updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
