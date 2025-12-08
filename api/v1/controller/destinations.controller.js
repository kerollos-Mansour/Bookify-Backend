const Destination = require("../../../shared/models/destinations.model");
const catchAsync = require("../../../shared/utils/catchError.utils");
const AppError = require("../../../shared/utils/appError.utils");

// post new destination
exports.createDestination = catchAsync(async (req, res) => {
    const data = req.body;
    try {
        const destination = new Destination(data);
        await destination.save();
        res.status(200).json(destination);
    } catch (error) {
        res.status(500).json(error.message);
    }
});
// GET /destinations?categoryId=123&page=1&limit=10 - Get all/filtered
exports.getAllDestinations = catchAsync(async (req, res) => {
    const { categoryId, page = 1, limit = 10 } = req.query;
    let query = {};

    if (categoryId) query.categoryId = categoryId;

    // pagination
    const skip = (page - 1) * limit;
    const destinations = await Destination.find(query)
        .skip(skip)
        .limit(Number(limit));
    res.status(201).json({
        status: "success",
        data: destinations,
    });
});

exports.getDestinationById = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let destination = await Destination.findById(id);
    if (!destination) return next(new AppError("Destination not found", 404));
    res.status(200).json(destination);
});

exports.deleteDestination = catchAsync(async (req, res) => {
    const id = req.params.id;
    let deleteDestination = await Destination.findByIdAndDelete(id);

    res.status(200).json(deleteDestination);
});

exports.updateDestination = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;

    const updatedDestination = await Destination.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
    if (!updatedDestination) {
        return next(new AppError('Destination not found', 404))
    }

    res.status(200).json({
        status: 'success',
        data: updatedDestination
    });
});
