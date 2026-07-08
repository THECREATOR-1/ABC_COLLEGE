const express = require('express');
const contactController = require('../controllers/contactController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { contactValidation } = require('../middleware/validators');

const router = express.Router();

router.post('/', contactValidation, validate, contactController.submit);
router.get('/', authMiddleware, contactController.getAll);

module.exports = router;
