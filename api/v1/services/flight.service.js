const Flight = require('../../../shared/models/flight.model');
const AppError = require('../../../shared/utils/appError.utils');
const httpStatusText = require('../../../shared/utils/httpStatusText');

class FlightService {
    /**
     * Get filter facets for dynamic filtering
     */
    async getFilterFacets(filters = {}) {
        const baseQuery = this._buildBaseQuery(filters);

        // Get all unique airlines with counts
        const airlines = await Flight.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$airline',
                    count: { $sum: 1 },
                    minPrice: { $min: '$pricing.economy.price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get stops distribution
        const stops = await Flight.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$stops',
                    count: { $sum: 1 },
                    minPrice: { $min: '$pricing.economy.price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get price range
        const priceRange = await Flight.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$pricing.economy.price' },
                    maxPrice: { $max: '$pricing.economy.price' }
                }
            }
        ]);

        // Get class availability
        const classes = await Flight.aggregate([
            { $match: baseQuery },
            {
                $facet: {
                    economy: [
                        { $match: { 'pricing.economy.available': true } },
                        { $count: 'count' }
                    ],
                    business: [
                        { $match: { 'pricing.business.available': true } },
                        { $count: 'count' }
                    ],
                    firstClass: [
                        { $match: { 'pricing.firstClass.available': true } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        return {
            airlines: airlines.map(a => ({
                name: a._id,
                count: a.count,
                minPrice: a.minPrice
            })),
            stops: stops.map(s => ({
                value: s._id,
                label: s._id === 0 ? 'Direct' : `${s._id} stop${s._id > 1 ? 's' : ''}`,
                count: s.count,
                minPrice: s.minPrice
            })),
            priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000 },
            classes: {
                economy: classes[0].economy[0]?.count || 0,
                business: classes[0].business[0]?.count || 0,
                firstClass: classes[0].firstClass[0]?.count || 0
            }
        };
    }

    _buildBaseQuery(filters) {
        const query = {};

        // Origin filter
        if (filters.origin) {
            query.$or = [
                { 'departure.airport.code': new RegExp(filters.origin, 'i') },
                { 'departure.airport.city': new RegExp(filters.origin, 'i') }
            ];
        }

        // Destination filter
        if (filters.destination) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { 'arrival.airport.code': new RegExp(filters.destination, 'i') },
                    { 'arrival.airport.city': new RegExp(filters.destination, 'i') }
                ]
            });
        }

        // Date filter
        if (filters.departureDate) {
            const startOfDay = new Date(filters.departureDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.departureDate);
            endOfDay.setHours(23, 59, 59, 999);

            query['departure.dateTime'] = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // Only scheduled flights
        query.status = 'scheduled';

        return query;
    }

    /**
     * Create a new flight
     */
    async createFlight(flightData, user) {
        // Only admins and vendors can create flights
        if (!user || (user.role !== 'admin' && user.role !== 'vendor')) {
            throw new AppError('You do not have permission to create flights', 403, httpStatusText.FAIL);
        }

        // Set owner if vendor
        if (user.role === 'vendor') {
            flightData.ownerId = user.userId;
        }

        const flight = await Flight.create(flightData);
        return flight;
    }

    /**
     * Get all flights with filtering, pagination, and sorting
     */
    async getAllFlights(filters = {}, pagination = {}, sorting = {}, user) {
        const query = this._buildBaseQuery(filters);

        // Airline filter
        if (filters.airline) {
            query.airline = new RegExp(filters.airline, 'i');
        }

        // Stops filter
        if (filters.stops !== undefined) {
            if (filters.stops === 'direct') {
                query.stops = 0;
            } else if (filters.stops === 'one') {
                query.stops = 1;
            } else if (filters.stops === 'multiple') {
                query.stops = { $gte: 2 };
            } else if (!isNaN(filters.stops)) {
                query.stops = Number(filters.stops);
            }
        }

        // Price filter
        if (filters.minPrice || filters.maxPrice) {
            const priceQuery = {};
            if (filters.minPrice) priceQuery.$gte = Number(filters.minPrice);
            if (filters.maxPrice) priceQuery.$lte = Number(filters.maxPrice);

            query.$or = query.$or || [];
            query.$or.push(
                { 'pricing.economy.price': priceQuery },
                { 'pricing.business.price': priceQuery },
                { 'pricing.firstClass.price': priceQuery }
            );
        }

        // Class filter
        if (filters.classOfService) {
            const classField = `pricing.${filters.classOfService}`;
            query[`${classField}.available`] = true;
            if (filters.passengers) {
                query[`${classField}.availableSeats`] = { $gte: Number(filters.passengers) };
            }
        }

        // Status filter (admin/vendor only)
        if (filters.status && user && ['admin', 'vendor'].includes(user.role)) {
            query.status = filters.status;
        }

        // Featured filter
        if (filters.featured !== undefined) {
            query.featured = filters.featured === 'true';
        }

        // Vendor filter (admin only)
        if (filters.ownerId && user && user.role === 'admin') {
            query.ownerId = filters.ownerId;
        } else if (user && user.role === 'vendor') {
            query.ownerId = user.userId;
        }

        // Pagination
        const page = Number(pagination.page) || 1;
        const limit = Number(pagination.limit) || 10;
        const skip = (page - 1) * limit;

        // Sorting
        let sort = {};
        if (sorting.sort) {
            switch (sorting.sort) {
                case 'price-asc':
                    sort = { 'pricing.economy.price': 1 };
                    break;
                case 'price-desc':
                    sort = { 'pricing.economy.price': -1 };
                    break;
                case 'duration':
                    sort = { duration: 1 };
                    break;
                case 'departure':
                    sort = { 'departure.dateTime': 1 };
                    break;
                default:
                    sort = { 'departure.dateTime': 1 };
            }
        } else {
            sort = { 'departure.dateTime': 1 };
        }

        // Execute query
        const [flights, total] = await Promise.all([
            Flight.find(query)
                .populate('ownerId', 'firstName lastName email')
                .sort(sort)
                .limit(limit)
                .skip(skip),
            Flight.countDocuments(query)
        ]);

        return {
            flights,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get flight by ID
     */
    async getFlightById(flightId) {
        const flight = await Flight.findById(flightId)
            .populate('ownerId', 'firstName lastName email');

        if (!flight) {
            throw new AppError('Flight not found', 404, httpStatusText.FAIL);
        }

        return flight;
    }

    /**
     * Update flight
     */
    async updateFlight(flightId, updateData, user) {
        const flight = await Flight.findById(flightId);

        if (!flight) {
            throw new AppError('Flight not found', 404, httpStatusText.FAIL);
        }

        // Permission check
        if (user.role === 'vendor' && flight.ownerId.toString() !== user.userId) {
            throw new AppError('You do not have permission to update this flight', 403, httpStatusText.FAIL);
        }

        if (user.role !== 'admin' && user.role !== 'vendor') {
            throw new AppError('You do not have permission to update flights', 403, httpStatusText.FAIL);
        }

        const updatedFlight = await Flight.findByIdAndUpdate(
            flightId,
            updateData,
            { new: true, runValidators: true }
        );

        return updatedFlight;
    }

    /**
     * Delete flight
     */
    async deleteFlight(flightId, user) {
        const flight = await Flight.findById(flightId);

        if (!flight) {
            throw new AppError('Flight not found', 404, httpStatusText.FAIL);
        }

        // Permission check
        if (user.role === 'vendor' && flight.ownerId.toString() !== user.userId) {
            throw new AppError('You do not have permission to delete this flight', 403, httpStatusText.FAIL);
        }

        if (user.role !== 'admin' && user.role !== 'vendor') {
            throw new AppError('You do not have permission to delete flights', 403, httpStatusText.FAIL);
        }

        await Flight.findByIdAndDelete(flightId);
    }

    /**
     * Get popular routes
     */
    async getPopularRoutes(limit = 10) {
        const routes = await Flight.aggregate([
            { $match: { status: 'scheduled' } },
            {
                $group: {
                    _id: {
                        from: '$departure.airport.city',
                        to: '$arrival.airport.city',
                        fromCode: '$departure.airport.code',
                        toCode: '$arrival.airport.code'
                    },
                    count: { $sum: 1 },
                    minPrice: { $min: '$pricing.economy.price' },
                    airlines: { $addToSet: '$airline' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return routes;
    }
}

module.exports = new FlightService();
