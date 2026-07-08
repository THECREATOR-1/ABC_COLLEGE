const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginValidation } = require('../middleware/validators');

const router = express.Router();

router.post('/login', loginValidation, validate, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
