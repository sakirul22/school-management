const express = require('express');
const router = express.Router();
const {
  getFeeStructures,
  upsertFeeStructure,
  getStudentFees,
  recordPayment,
  getPayments,
  getReceipt,
  getFines,
  createFine,
  updateFineStatus,
  getMyFees,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

// Student portal fee view
router.get('/my-fees', protect, authorize('student'), getMyFees);

// Receipts
router.get('/receipt/:id', protect, getReceipt);

// Fee Structures
router.get('/structures', protect, getFeeStructures);
router.post('/structures', protect, authorize('admin'), upsertFeeStructure);

// Student Fees
router.get('/student-fees', protect, authorize('admin'), getStudentFees);

// Payments
router.get('/payments', protect, authorize('admin'), getPayments);
router.post('/record-payment', protect, authorize('admin'), recordPayment);

// Fines
router.get('/fines', protect, authorize('admin'), getFines);
router.post('/fines', protect, authorize('admin'), createFine);
router.put('/fines/:id/status', protect, authorize('admin'), updateFineStatus);

module.exports = router;
