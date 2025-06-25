const express = require('express');
const carController = require('../controllers/carController');
const protection = require('../middlewares/protectionMiddleware');
const restriction = require('../middlewares/restrictionMiddleware');
const router = express.Router();

router
  .route('/')
  .get(carController.getAllCars)
  .post(
    protection,
    restriction(['admin', 'moderator'], { resource: 'cars', action: 'write' }),
    carController.createCar
  );

router
  .route('/:id')
  .get(carController.getCar)
  .patch(protection, restriction(['admin', 'moderator'], { resource: 'cars', action: 'edit' }), carController.updateCar)
  .delete(
    protection,
    restriction(['admin', 'moderator'], { resource: 'cars', action: 'delete' }),
    carController.deleteCar
  );

module.exports = router;
