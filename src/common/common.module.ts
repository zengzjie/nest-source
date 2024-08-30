import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import {
  CatsService,
  DogsService,
  PigService,
  UseFactory,
} from "../cats/cats.service";

@Module({
  providers: [
    {
      provide: "SUFFIX",
      useValue: "custom-suffix",
    },
    CommonService,

    CatsService, // 这样定义 provider 的话，相当于 token 值就是类本身
    {
      provide: DogsService,
      useClass: DogsService, // 提供者是一个类
    },
    // 这是一种通过字符串注入的方式
    {
      // 这是一个 Token，或者说是一个标识符、令牌，用于标识一个 provider 的名字
      provide: "PigService",
      // 这是一个 provider 的实例或者值
      useValue: new PigService("This is a"),
    },
    {
      provide: "FactoryToken",
      inject: ["prefix111", "SUFFIX"],
      useFactory: (arg1, arg2) => new UseFactory(arg1, arg2),
      //   useFactory: () => new CatsService('自定义参数'),
    },
  ],
  // 源码上 useValue 是不需要手动导出去进行注入的，其他都需要手动导出才会进行注入
  exports: [CommonService, CatsService, DogsService, "FactoryToken"],
})
export class CommonModule {}
