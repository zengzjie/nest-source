import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Type,
} from "@nestjs/common";
import { MulterOptions } from "../interfaces/multer-options.interface";
import { Observable } from "rxjs";
import { Request, Response } from "express";
import multer from "multer";
import { MULTER_MODULE_OPTIONS } from "../files.constants";

export const FileInterceptor = (
  fieldName: string,
  localOptions?: MulterOptions
): Type<NestInterceptor> => {
  @Injectable()
  class FileInterceptor implements NestInterceptor {
    constructor(
      @Inject(MULTER_MODULE_OPTIONS) private options?: MulterOptions
    ) {}
    // 实现了 NestInterceptor 接口的类，可以通过实现 intercept 方法来实现拦截器的逻辑
    async intercept(
      context: ExecutionContext,
      next: CallHandler<any>
    ): Promise<Observable<any>> {
      const configure = Object.assign(localOptions ?? {}, this.options);

      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      // 当需要处理单个字段的单个文件上传的时候可以使用 single(fieldName) 得到一个 Express 中间件函数
      const triggerMulter = configure
        ? multer(configure).single(fieldName)
        : multer().single(fieldName);
      // 使用Promise包装，当触发了 multer.single(fieldName) 之后，通过回调函数的方式来处理请求和响应
      await new Promise<void>((resolve, reject) => {
        triggerMulter(request, response, (error) => {
          if (error) {
            reject(error);
          }
          resolve(); // 处理上传的文件并赋值给 request.file
        });
      });

      // 等待异步上传完后在调用 next.handle() 方法继续执行下一个拦截器或者处理器
      return next.handle();
    }
  }

  return FileInterceptor;
};
