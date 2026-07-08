const express = require('express');
const departmentController = require('../controllers/departmentController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { departmentValidation } = require('../middleware/validators');

const router = express.Router();

router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', authMiddleware, upload.single('image'), departmentValidation, validate, departmentController.create);
router.put('/:id', authMiddleware, upload.single('image'), departmentValidation, validate, departmentController.update);
router.delete('/:id', authMiddleware, departmentController.remove);

module.exports = router;
