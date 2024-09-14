import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { UserController } from "./user/user.controller";
import { CoreModule } from "./core/core.module";
import { GlobalModule } from "./global.module";
import { CreateDynamicModule } from "./dynamicModule/dynamic.module";
import { DogsService } from "./cats/cats.service";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import { AppService } from "./app.service";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { CustomExceptionFilter } from "./filter/custom-exception.filter";
import { AuthMiddleware } from "./auth/auth.middleware";
import { AuthGuard } from "./auth/auth.guard";
import { CreateDecoratorAuth } from "./auth/create-decorator-auth.guard";
import { Logger5Interceptor, Logger6Interceptor } from "./interceptor";
import { MulterModule } from "@nestjs/platform-express";

function LoggerMiddleware1 (req, res, next) {
  console.log("LoggerMiddleware1 before");
  next();
}

function LoggerMiddleware2 (req, res, next) {
  console.log("LoggerMiddleware2 before");
  next();
}

@Module({
  imports: [
    CreateDynamicModule.forRoot({
      apiKey: "base_main",
    }),
    MulterModule.register({
      dest: './upload'
    })
  ],
  controllers: [AppController, UserController],
  // imports 中的 providers 如果需要用到其他模块或者服务，需要在这里先注册了，才能在 imports 中使用
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: CreateDecoratorAuth
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: Logger6Interceptor
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: Logger5Interceptor
    // }
  ],
})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      // forRoutes 可以传入多个参数，表示多个路由前缀
      // .forRoutes("config");
      // .forRoutes({ path: "config", method: RequestMethod.POST });
      .exclude({ path: "config", method: RequestMethod.GET })
      .forRoutes(AppController);

      // .apply(LoggerMiddleware1).forRoutes(AppController)
      // .apply(LoggerMiddleware2).forRoutes(UserController);

      // 优化场景: 
      // 目前在访问 AppController2 中的任何路由时，都会执行 LoggerMiddleware1 和 LoggerMiddleware2 中间件
      // 但希望只在访问 AppController2 中的路由只执行 LoggerMiddleware2 中间件, 它们之间是隔离的
      // apply(LoggerMiddleware1).forRoutes(AppController1).apply(LoggerMiddleware2).forRoutes(AppController2);
  }
}

export { AppModule };
