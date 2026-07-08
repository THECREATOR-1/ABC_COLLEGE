const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/registrationController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registrationValidation } = require('../middleware/validators');

// ⚠️ Specific routes MUST come before /:id
router.post('/',                  registrationValidation, validate, ctrl.register);
router.post('/verify-payment',    ctrl.verifyPayment);
router.get('/stats',              authMiddleware, ctrl.getStats);
router.get('/export',             authMiddleware, ctrl.exportData);
router.get('/charts',             authMiddleware, ctrl.getChartData);
router.get('/lookup/:regId',      ctrl.getByRegistrationId);   // public participant lookup
router.get('/',                   authMiddleware, ctrl.getAll);
router.get('/:id',                authMiddleware, ctrl.getByDbId);
router.patch('/:id/status',       authMiddleware, ctrl.updateStatus);
router.delete('/:id',             authMiddleware, ctrl.deleteRegistration);

module.exports = router;
