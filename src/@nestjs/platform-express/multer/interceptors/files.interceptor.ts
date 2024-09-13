import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from "@nestjs/common";
import { MulterOptions } from "../interfaces/multer-options.interface";
import { Observable } from "rxjs";
import { Request, Response } from "express";
import multer from "multer";

enum MulterError {
  LIMIT_UNEXPECTED_FILE = "超出了文件数量限制"
}

export const FilesInterceptor = (
  fieldName: string,
  maxCount?: number,
  localOptions?: MulterOptions
): Type<NestInterceptor> => {
  @Injectable()
  class FilesInterceptor implements NestInterceptor {
    // 实现了 NestInterceptor 接口的类，可以通过实现 intercept 方法来实现拦截器的逻辑
    async intercept(
      context: ExecutionContext,
      next: CallHandler<any>
    ): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      // 当需要处理单个字段的多个文件上传的时候可以使用 array(fieldName) 得到一个 Express 中间件函数
      const triggerMulter = localOptions ? multer(localOptions).array(fieldName, maxCount) : multer().array(fieldName, maxCount);
      // 使用Promise包装，当触发了 multer.array(fieldName) 之后，通过回调函数的方式来处理请求和响应
      await new Promise<void>((resolve, reject) => {
        triggerMulter(request, response, (error) => {
          const message = MulterError[error.code] ? error.field + ' ' + MulterError[error.code] : error.message;
          if (error) {
            reject(new Error(message));
          }
          resolve(); // 处理上传的文件并赋值给 request.files
        });
      });

      // 等待异步上传完后在调用 next.handle() 方法继续执行下一个拦截器或者处理器
      return next.handle();
    }
  }

  return FilesInterceptor;
};
