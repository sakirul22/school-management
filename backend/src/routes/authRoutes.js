const express = require('express');
const router = express.Router();
const { login, getMe, logout, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);

module.exports = router;
