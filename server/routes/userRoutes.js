const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getAdminStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/admin/stats', protect, adminOnly, getAdminStats);

module.exports = router;
