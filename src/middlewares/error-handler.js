import { HttpException } from '../errors/http-exception.js';

export const errorHandler = (error, req, res, _next) => {
  if (error instanceof HttpException) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.log('error', error);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
