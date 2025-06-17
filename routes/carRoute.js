const express = require('express');
const carController = require('../controllers/carController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

//post ,patch,delete allowed only for admin

router.route('/').get(carController.getAllCars).post(verifyToken, carController.createCar);
router.get('/:id', carController.getCar);

router
  .route('/:id')
  .get(carController.getCar)
  .patch(verifyToken, carController.updateCar)
  .delete(verifyToken, carController.deleteCar);
module.exports = router;
