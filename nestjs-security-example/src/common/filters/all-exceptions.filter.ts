import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      typeof (exception as any)?.getStatus === "function"
        ? (exception as HttpException).getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      typeof (exception as any)?.getResponse === "function"
        ? (exception as HttpException).getResponse()
        : "Internal server error";

    response
      .status(status)
      .json(
        typeof message === "string" ? { statusCode: status, message } : message
      );
  }
}
