const express = require('express');
const router = express.Router();
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSections,
  createSection,
  deleteSection,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/classSubjectController');
const { protect, authorize } = require('../middleware/auth');

// Classes
router.get('/classes', protect, getClasses);
router.post('/classes', protect, authorize('admin'), createClass);
router.put('/classes/:id', protect, authorize('admin'), updateClass);
router.delete('/classes/:id', protect, authorize('admin'), deleteClass);

// Sections
router.get('/sections', protect, getSections);
router.post('/sections', protect, authorize('admin'), createSection);
router.delete('/sections/:id', protect, authorize('admin'), deleteSection);

// Subjects
router.get('/subjects', protect, getSubjects);
router.post('/subjects', protect, authorize('admin'), createSubject);
router.put('/subjects/:id', protect, authorize('admin'), updateSubject);
router.delete('/subjects/:id', protect, authorize('admin'), deleteSubject);

module.exports = router;
