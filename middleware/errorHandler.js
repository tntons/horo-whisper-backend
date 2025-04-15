// Custom error class for known operational errors
class AppError extends Error {
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle specific known errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message
        });
    }

    // Handle unknown errors
    console.error('Error:', err);
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong!'
    });
};

module.exports = {
    AppError,
    errorHandler
};