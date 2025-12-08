const Hotel = require('../../../shared/models/hotel.model');
const mongoose = require('mongoose');
const httpStatusText = require('../../../shared/utils/appError');
const AppError = require('../../../shared/utils/appError');

const createHotel = async (req, res, next) => {
    try {
        //  Create with only allowed fields
        const payload = req.body;
        //  set Validation or if conditions on the payload

        // Create with only allowed fields
        const hotel = new Hotel(payload);
        await hotel.save();
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { hotel: hotel } });
    }
    catch (err) {
        next(err);
    }
}


const getHotels = async (req, res, next) => {
    try {
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filters
        const filters = {};
        if (req.query.city) {
            filters["location.city"] = req.query.city;
        }
        if (req.query.country) {
            filters["location.countryCode"] = req.query.country;
        }
        if (req.query.minRate) {
            filters.lowRate = { $gte: Number(req.query.minRate) };
        }
        if (req.query.maxRate) {
            filters.highRate = { $lte: Number(req.query.maxRate) };
        }
        if (req.query.propertyCategory) {
            filters.propertyCategory = req.query.propertyCategory;
        }

        
        // Search by name
        if (req.query.search) {
            filters.name = { $regex: req.query.search, $options: 'i' };
        }

        // sorting
        const sort = {};
        if (req.query.sort === "rating") {
            sort.hotelRating = 1;
        } else if (req.query.sort === "-rating") {
            sort.hotelRating = -1;
        } else {
            sort.createdAt = -1;
        }

        const hotels = await Hotel.find(filters).sort(sort).skip(skip).limit(limit);
        const total = await Hotel.countDocuments(filters);

        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {
                hotels: hotels,
                page: page,
                totalPages: Math.ceil(total / limit),
                totalHotels: total
            }
        });
    } catch (err) {
        next(AppError.create(err.message, 500, httpStatusText.ERROR));
    }
}

const getHotelById = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return next(AppError.create("Invalid hotel ID", 400, httpStatusText.FAIL));
        }

        const hotel = await Hotel.findById(hotelId);
        // i will populate when hotelDetails and rooms are created
        if (!hotel) {
            return next(AppError.create("Hotel not found", 404, httpStatusText.FAIL));
        }
        res.status(200).json({ status: httpStatusText.SUCCESS, data: { hotel: hotel } });
    } catch (err) {
        next(err);
    }
}

const updateHotel = async (req, res, next) => {
    try {

        const hotelId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: "Invalid hotel ID" });
        }
        // FIX: Anyone can update ANY field including ratings! 
        const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, req.body, { new: true });
        if (!updatedHotel) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Hotel not found" });
        }
        res.status(200).json({ status: httpStatusText.SUCCESS, data: { hotel: updatedHotel } });
    } catch (err) {
        next(err);
    }
}

const deleteHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: "Invalid hotel ID" });
        }
        const deletedHotel = await Hotel.findByIdAndDelete(hotelId);
        if (!deletedHotel) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Hotel not found" });
        }
        res.status(200).json({ status: httpStatusText.SUCCESS, message: "Hotel deleted successfully" });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
};