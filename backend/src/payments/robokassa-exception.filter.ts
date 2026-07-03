import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class RobokassaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const safeStatus =
      status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.BAD_REQUEST;

    response.status(safeStatus).type("text/plain; charset=utf-8").send("bad sign");
  }
}
