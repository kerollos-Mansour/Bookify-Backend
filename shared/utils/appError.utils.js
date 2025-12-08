class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // error from handling the body with the body (request)
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError;