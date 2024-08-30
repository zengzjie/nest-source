import {
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

/**
 * 过滤器处理类型为 HttpException (及其子类) 的异常
 * 当异常是未识别的（既不是 HttpException 也不是继承自 HttpException 的类）
 * 内置的异常过滤器会生成以下默认的 JSON 响应：{ "statusCode": 500, "message": "Internal server error" }
 */
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception, "exception ===> exception");

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 如果响应已经被发送，则不做任何处理
    if (response.headersSent) {
      return;
    }

    // 获取异常的状态码
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取异常的消息
    let message = exception.message;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (res && typeof res === "object") {
        return response.status(statusCode).json(res);
      }
    }

    return response.status(statusCode).json({
      statusCode: statusCode,
      message: message || "Internal server error",
    });
  }
}
