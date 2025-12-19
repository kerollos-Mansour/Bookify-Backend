const Destination = require("../../../shared/models/destinations.model");
const AppError = require("../../../shared/utils/appError.utils");

/**
 * Create a new destination with pre-configured search
 */
const createDestination = async (data) => {
    // Generate slug from name if not provided
    if (!data.slug) {
        data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    const destination = new Destination(data);
    await destination.save();
    return destination;
};

/**
 * Get all destinations, optionally filtered by category
 */
const getAllDestinations = async (filters = {}, pagination = {}) => {
    const { page = 1, limit = 10 } = pagination;
    const query = { isActive: true };

    if (filters.categoryId) {
        query.categoryId = filters.categoryId;
    }
    
    if (filters.bestSeller) {
        query.bestSeller = true;
    }
    
    if (filters.featured) {
        query.featured = true;
    }

    const skip = (page - 1) * limit;

    const [destinations, total] = await Promise.all([
        Destination.find(query)
            .populate("categoryId", "name slug icon")
            .sort({ displayOrder: 1, name: 1 })
            .skip(skip)
            .limit(Number(limit)),
        Destination.countDocuments(query)
    ]);

    return {
        destinations,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get destination by ID or slug
 */
const getDestination = async (identifier) => {
    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: identifier }
        : { slug: identifier };
    
    const destination = await Destination.findOne(query)
        .populate("categoryId", "name slug icon");

    if (!destination) {
        throw new AppError("Destination not found", 404);
    }

    return destination;
};

/**
 * THE KEY METHOD: Execute the pre-configured search for a destination
 * This is what gets called when user clicks "Explore Cairo"
 */
const searchByDestination = async (destinationId, userOverrides = {}, pagination = {}) => {
    // 1. Get the destination with its pre-configured search
    const destination = await getDestination(destinationId);
    
    // 2. Build filters from searchConfig + user overrides
    const searchConfig = destination.searchConfig || {};
    
    const filters = {
        // Pre-configured values (from destination)
        location: searchConfig.location,
        city: searchConfig.city,
        country: searchConfig.country,
        minRate: searchConfig.minRate,
        maxRate: searchConfig.maxRate,
        propertyCategory: searchConfig.propertyCategory,
        minRating: searchConfig.minRating,
        
        // User can override these on the search page
        ...userOverrides
    };
    
    // Clean up null/undefined values
    Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === undefined) {
            delete filters[key];
        }
    });
    
    // 3. Sorting - use user's choice or destination default
    const sorting = {
        sort: userOverrides.sort || searchConfig.defaultSort || '-rating'
    };
    
    // 4. Pagination
    const paginationConfig = {
        page: pagination.page || 1,
        limit: pagination.limit || searchConfig.defaultLimit || 10
    };
    
    // 6. Return results with destination context
    return {
        destination: {
            id: destination._id,
            name: destination.name,
            slug: destination.slug,
            description: destination.description,
            image: destination.image,
            category: destination.categoryId
        },
        appliedFilters: filters,
        appliedSort: sorting.sort,
    };
};

/**
 * Get destinations grouped by category (for homepage display)
 */
const getDestinationsGroupedByCategory = async () => {
    const destinations = await Destination.aggregate([
        { $match: { isActive: true } },
        { $sort: { displayOrder: 1 } },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $group: {
                _id: '$categoryId',
                category: { $first: '$category' },
                destinations: {
                    $push: {
                        _id: '$_id',
                        name: '$name',
                        slug: '$slug',
                        image: '$image',
                        description: '$description',
                        rating: '$rating',
                        bestSeller: '$bestSeller',
                        searchConfig: '$searchConfig'
                    }
                }
            }
        },
        { $sort: { 'category.displayOrder': 1 } }
    ]);
    
    return destinations;
};

const updateDestination = async (id, data) => {
    const updatedDestination = await Destination.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!updatedDestination) {
        throw new AppError("Destination not found", 404);
    }

    return updatedDestination;
};

const deleteDestination = async (id) => {
    const deletedDestination = await Destination.findByIdAndDelete(id);

    if (!deletedDestination) {
        throw new AppError("Destination not found", 404);
    }

    return deletedDestination;
};

module.exports = {
    createDestination,
    getAllDestinations,
    getDestination,
    searchByDestination,         
    getDestinationsGroupedByCategory,
    updateDestination,
    deleteDestination,
};