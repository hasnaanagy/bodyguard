const router = require('express').Router();
const adminController = require('../controllers/adminController');
const protection = require('../middlewares/protectionMiddleware');
const restriction = require('../middlewares/restrictionMiddleware');

router.route('/:id/assign-permissions').patch(protection, restriction(['admin']), adminController.assignPermissions);
router.route('/:id/revoke-permissions').patch(protection, restriction(['admin']), adminController.revokePermission);

router.route('/').post(protection, restriction(['admin']), adminController.createAdminsAndModerators);

module.exports = router;
