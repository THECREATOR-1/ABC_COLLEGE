const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { eventValidation } = require('../middleware/validators');

const router = express.Router();

router.get('/', eventController.getAll);
router.get('/upcoming', eventController.getUpcoming);
router.get('/stats', eventController.getStats);
router.get('/:id', eventController.getById);
router.post('/', authMiddleware, upload.single('image'), eventValidation, validate, eventController.create);
router.put('/:id', authMiddleware, upload.single('image'), eventValidation, validate, eventController.update);
router.delete('/:id', authMiddleware, eventController.remove);

module.exports = router;
