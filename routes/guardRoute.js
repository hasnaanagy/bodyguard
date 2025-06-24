const express = require('express');
const guardController = require('../controllers/guardController');
const router = express.Router();
const bookingRoutes = require('./bookingRoutes');
const protection = require('../middlewares/protectionMiddleware');

router.use('/:guardId/bookings', bookingRoutes);

router.route('/').get(protection, guardController.getAllGuards);

router.route('/pending').get(guardController.getAllPendingGuards);
router.route('/:id').get(guardController.getGuard).patch(guardController.UpdateGuardStatus);

module.exports = router;
