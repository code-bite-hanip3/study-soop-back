import { HttpException } from './http-exception.js';

export class UnauthorizedException extends HttpException {
  constructor(description = 'Unauthorized') {
    super(401, description);
  }
}
