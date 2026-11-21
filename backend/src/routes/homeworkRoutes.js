const express = require('express');
const router = express.Router();
const {
  getHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  getHomeworkSubmissions,
  evaluateSubmission,
  getStudentHomeworks,
  submitHomework,
} = require('../controllers/homeworkController');
const { protect, authorize } = require('../middleware/auth');

// Student routes
router.get('/student', protect, authorize('student'), getStudentHomeworks);
router.post('/student/submit', protect, authorize('student'), submitHomework);

// Teacher / Admin routes
router.get('/', protect, authorize('admin', 'teacher'), getHomeworks);
router.post('/', protect, authorize('admin', 'teacher'), createHomework);
router.put('/:id', protect, authorize('admin', 'teacher'), updateHomework);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteHomework);

// Submissions & Evaluation
router.get('/:id/submissions', protect, authorize('admin', 'teacher'), getHomeworkSubmissions);
router.put('/submissions/:submissionId/evaluate', protect, authorize('teacher', 'admin'), evaluateSubmission);

module.exports = router;
