import { ApiError } from '../utils/ApiError.js';

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Transform standard Error to ApiError if necessary
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  res.status(error.statusCode).json(response);
};

export { errorMiddleware };
