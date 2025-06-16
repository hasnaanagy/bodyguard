const express = require('express');
const guardController = require('../controllers/guardController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/', verifyToken, guardController.createGuard);
router.patch('/:id', verifyToken, guardController.updateGuard);
router.get('/pending', verifyToken, guardController.getPendingGuards);
router.patch('/:id/verify', verifyToken, guardController.verifyGuard);

module.exports = router;
