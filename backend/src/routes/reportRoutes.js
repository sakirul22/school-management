const express = require('express');
const router = express.Router();
const { getReportData } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getReportData);

module.exports = router;
