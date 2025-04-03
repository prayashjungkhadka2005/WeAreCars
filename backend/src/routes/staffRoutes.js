const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Get staff profile (protected route example)
router.get('/profile', protect, authorize('staff'), (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router; 