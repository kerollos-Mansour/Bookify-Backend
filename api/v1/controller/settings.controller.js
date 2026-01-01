const Settings = require('../../../shared/models/settings.model');
const catchAsync = require('../../../shared/utils/catchError.utils');

exports.getSettings = catchAsync(async (req, res, next) => {
    const settings = await Settings.getSettings();

    res.status(200).json({
        status: 'success',
        data: {
            settings
        }
    });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
    const settings = await Settings.getSettings();

    // Update fields if provided
    if (req.body.currency) settings.currency = req.body.currency;
    if (req.body.maintenanceMode !== undefined) settings.maintenanceMode = req.body.maintenanceMode;

    await settings.save();

    res.status(200).json({
        status: 'success',
        data: {
            settings
        }
    });
});
