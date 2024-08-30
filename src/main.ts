// 从 @nestjs/core 模块中导入 NestFactory 用于创建 Nest 应用程序
import { NestFactory } from "@nestjs/core";
// 导入应用程序的主模块
import { AppModule } from "./app.module";
// 导入 express-session 中间件，用于管理会话
import session from "express-session";
// 导入 express 模块
import express from "express";
import { Logger } from "@nestjs/common";
import { CustomExceptionFilter } from "./filter/custom-exception.filter";

const PORT = process.env.PORT || 3000;

// 定义一个异步的启动函数
async function bootstrap() {
  // 创建一个 Nest 应用程序实例，传入主模块
  const app = await NestFactory.create(AppModule);

  // app.useGlobalFilters(CustomExceptionFilter);
  // 使用 express-session 中间件来管理会话
  app.use(
    session({
      secret: "my-secret", // 签名会话ID的秘密
      name: "nest-session", // 设置 cookie 的名称，默认是 'connect.sid
      resave: false, // 强制保存 session ，即使它并没有变化
      saveUninitialized: false, // 强制将未初始化的session存储
      // 设置 session 的有效时间, httpOnly 表示只能通过 HTTP 协议访问 cookie, secure 表示只有在 HTTPS 下才能访问 cookie
      cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false },
      rolling: true, // 每次请求都重新设置 cookie 的有效时间
    })
  );

  // 启动应用程序，监听 3000 端口
  await app.listen(PORT, () => {
    Logger.log(
      `Application is running on http://localhost:${PORT}`,
      "NestApplication"
    );
  });
}

// 调用启动函数，启动应用程序
bootstrap();
