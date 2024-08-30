import { Type } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { NestApplication } from "@nestjs/core";

export class NestFactory {
  static create(module: Type) {
    // 启动 Nest 应用时打印日志
    Logger.log("Starting Nest application...", NestFactory.name);
    // new Logger().log("Starting Nest application...", NestFactory.name);
    // 创建 Nest 应用实例
    const app = new NestApplication(module);
    // 返回 Nest 应用实例
    return app;
  }
}
