import { HttpException, HttpStatus } from '@nestjs/common';

export class LoginException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
