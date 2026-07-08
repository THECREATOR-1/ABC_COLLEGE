const express = require('express');
const galleryController = require('../controllers/galleryController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', galleryController.getAll);
router.post('/', authMiddleware, upload.single('image'), galleryController.create);
router.delete('/:id', authMiddleware, galleryController.remove);

module.exports = router;
