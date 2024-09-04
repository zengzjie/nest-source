import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppService } from "src/app.service";

@Catch(BadRequestException)
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly appServer: AppService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.BAD_REQUEST;

    let message = exception.message || "Bad Request";
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (res && typeof res === "object") {
        message = res;
      }
    }

    return response.status(statusCode).json({
      code: statusCode,
      msg: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
