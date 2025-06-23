const express = require('express');
const guardController = require('../controllers/guardController');
const router = express.Router();
const bookingRoutes = require('./bookingRoutes');

router.use('/:guardId/bookings', bookingRoutes);

router.route('/').get(guardController.getAllGuards);

router.route('/pending').get(guardController.getAllPendingGuards);
router.route('/:id').get(guardController.getGuard).patch(guardController.UpdateGuardStatus);

module.exports = router;
