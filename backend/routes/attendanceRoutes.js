const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/verify', authMiddleware, attendanceController.verifyQR);
router.post('/mark', authMiddleware, attendanceController.markAttendance);
router.get('/', authMiddleware, attendanceController.getAttendanceList);

module.exports = router;
