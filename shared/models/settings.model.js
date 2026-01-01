const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'EGP'],
        default: 'USD'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
