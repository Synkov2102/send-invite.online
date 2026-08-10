import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

/**
 * Robokassa считает провалом любой ответ, кроме `OK<InvId>`, и повторяет
 * уведомление — поэтому тело важно только нам. Внутренние сбои не выдаём за
 * проблему с подписью: иначе падение Mongo выглядит в кабинете как неверный
 * ключ и уводит разбор инцидента не туда.
 */
@Catch()
export class RobokassaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RobokassaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const isServerError = status >= HttpStatus.INTERNAL_SERVER_ERROR;

    if (isServerError) {
      this.logger.error(
        `Robokassa callback failed: ${
          exception instanceof Error ? exception.message : String(exception)
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response
      .status(isServerError ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.BAD_REQUEST)
      .type("text/plain; charset=utf-8")
      .send(isServerError ? "internal error" : "bad sign");
  }
}
