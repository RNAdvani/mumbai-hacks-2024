"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.message = message;
        this.statusCode = statusCode;
    }
}
exports.ErrorHandler = ErrorHandler;
const errorResponse = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Something went wrong';
    next(res.status(err.statusCode).json({
        success: false,
        message: err.message
    }));
};
exports.default = errorResponse;
//# sourceMappingURL=errorResponse.js.map