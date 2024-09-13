import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request, Response } from "express";

export const NoFilesInterceptor = (): Type<NestInterceptor> => {
  @Injectable()
  class NoFilesInterceptor implements NestInterceptor {
    // 实现了 NestInterceptor 接口的类，可以通过实现 intercept 方法来实现拦截器的逻辑
    async intercept(
      context: ExecutionContext,
      next: CallHandler<any>
    ): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();
      
      if (request.file || request.files) {
        throw new BadRequestException("File is not allowed");
      }

      // 等待异步上传完后在调用 next.handle() 方法继续执行下一个拦截器或者处理器
      return next.handle();
    }
  }

  return NoFilesInterceptor;
};
