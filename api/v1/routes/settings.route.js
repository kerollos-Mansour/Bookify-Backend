const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settings.controller');
// Add auth middleware if needed, e.g. protect with admin rights
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middleware");

router.use(protect);
router.use(allowTo('admin'));

router
    .route('/')
    .get(settingsController.getSettings)
    .patch(settingsController.updateSettings);

module.exports = router;
