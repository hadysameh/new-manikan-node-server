class AppError extends Error {
  constructor(message, httpStatus) {
    super(message);
    this.httpStatus = httpStatus;
    this.status = 0;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
