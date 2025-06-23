const express = require('express');
const guardController = require('../controllers/guardController');
const router = express.Router();

router.route('/').get(guardController.getGuards);

module.exports = router;
