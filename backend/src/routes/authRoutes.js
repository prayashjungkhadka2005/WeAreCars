const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Staff registration route
router.post('/staff/register', register);

// Staff login route
router.post('/staff/login', login);

module.exports = router; 