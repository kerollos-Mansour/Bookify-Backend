const AppError = require("../utils/appError.utils");

const validate = (schemas) => {
    return (req, res, next) => {
        // Handle both old format (single schema for body) and new format (object with body, params, query)
        let schemaToValidate = schemas;
        let dataToValidate = req.body;
        let source = "body";

        // If schemas is an object with properties, validate all sources
        if (schemas && typeof schemas === "object" && !schemas.validate) {
            const allErrors = [];

            // Validate body
            if (schemas.body) {
                const { error } = schemas.body.validate(req.body, {
                    abortEarly: false,
                });
                if (error) {
                    allErrors.push(
                        ...error.details.map(
                            (detail) => `Body - ${detail.message}`
                        )
                    );
                }
            }

            // Validate params
            if (schemas.params) {
                const { error } = schemas.params.validate(req.params, {
                    abortEarly: false,
                });
                if (error) {
                    allErrors.push(
                        ...error.details.map(
                            (detail) => `Params - ${detail.message}`
                        )
                    );
                }
            }

            // Validate query
            if (schemas.query) {
                const { error } = schemas.query.validate(req.query, {
                    abortEarly: false,
                });
                if (error) {
                    allErrors.push(
                        ...error.details.map(
                            (detail) => `Query - ${detail.message}`
                        )
                    );
                }
            }

            if (allErrors.length > 0) {
                const message = allErrors.join(", ").replace(/"/g, "");
                return next(new AppError(message, 400));
            }
        } else {
            // Old format: single schema for body validation
            const { error } = schemas.validate(req.body, { abortEarly: false });
            if (error) {
                const message = error.details
                    .map((detail) => detail.message)
                    .join(", ")
                    .replace(/"/g, "");
                return next(new AppError(message, 400));
            }
        }

        next();
    };
};

module.exports = validate;
