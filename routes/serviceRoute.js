const Router = require('express').Router();
const { getAllServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const protect = require('../middlewares/protectionMiddleware');
const restrict = require('../middlewares/restrictionMiddleware');

// Router.route('/').get(protect, getAllServices).post(protect, restrict('admin'), createService);
Router.route('/').get(protect, getAllServices).post(createService);
Router.route('/:id').patch(updateService).delete(deleteService);
module.exports = Router;
