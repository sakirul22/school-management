const express = require('express');
const router = express.Router();
const {
  getAdmissions,
  createAdmission,
  approveAdmission,
  rejectAdmission,
} = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAdmissions);
router.post('/', protect, authorize('admin'), createAdmission);
router.put('/:id/approve', protect, authorize('admin'), approveAdmission);
router.put('/:id/reject', protect, authorize('admin'), rejectAdmission);

module.exports = router;
