const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/venueController');
const { authMiddleware } = require('../middleware/auth');

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    authMiddleware, ctrl.create);
router.put('/:id',  authMiddleware, ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

module.exports = router;
