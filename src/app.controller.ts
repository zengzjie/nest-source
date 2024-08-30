import {
  BadRequestException,
  Controller,
  CustomPipe,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  ParseFloatPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  UseFilters,
  ParseUUIDPipe,
  ParseEnumPipe,
} from "@nestjs/common";
import {
  CatsService,
  DogsService,
  PigService,
  UseFactory,
} from "./cats/cats.service";
import { CommonService } from "./common/common.service";
import { CoreService } from "./core/core.service";
import { CustomExceptionFilter } from "./filter/custom-exception.filter";
import { Param } from "@nestjs/common";
import { Query } from "@nestjs/common";

enum Roles {
  USER = "user",
  ADMIN = "admin",
}

@Controller()
// @UseFilters(CustomExceptionFilter)
class AppController {
  constructor(
    private coreService: CoreService,
    private commonService: CommonService,
    private catsService: CatsService,
    private dogsService: DogsService,
    @Inject("PigService") private pig: PigService,
    @Inject("FactoryToken") private factoryService: UseFactory,
    @Inject("PREFIX") private prefix: string,
    @Inject("FOOT") private foot: string
  ) {}

  // @Inject()
  // private pig: string;
  // 使用 Get 装饰器标记 index 方法为 HTTP, GET 路由处理程序
  @Get()
  index(): string {
    // throw new Error();
    // throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    throw new HttpException(
      {
        errorCode: "C89990",
        status: HttpStatus.FORBIDDEN,
        error: "这是一个自定义错误",
      },
      HttpStatus.FORBIDDEN
    );
    return "Hello World!";
  }

  @Get("bad-request")
  // @UseFilters(CustomExceptionFilter)
  // @UseFilters(new CustomExceptionFilter())
  handleBadRequest(): string {
    // 设置了 APP_FILTER 则这里需要走到 APP_FILTER 中的 CustomExceptionFilter
    throw new BadRequestException("This is a bad request exception");
  }

  @Get("cat")
  handleCat(): string {
    return this.catsService.eat();
  }

  @Get("dog")
  handleDog(): string {
    return this.dogsService.eat();
  }

  @Get("factory")
  handleFactory(): string {
    console.log(this.pig.eat(), "这是🐷的实例");

    return this.factoryService.log();
  }

  @Get("common")
  handleCommon(): string {
    return this.commonService.log();
  }

  @Get("core")
  handleCore(): string {
    return this.coreService.log();
  }

  @Get("dynamic")
  handleDynamic(): string {
    console.log(this.dogsService, "this.dogsService");

    return this.dogsService.eat() + " Dynamic Module " + this.foot;
  }

  @Get("config")
  handleConfig(): string {
    return "config";
  }

  @Post("config")
  handlePostConfig(): string {
    return "post config";
  }

  @Get("pipe/:id/:role")
  handlePipe(@Param("id", ParseIntPipe, CustomPipe) id: number, @Param('role', new ParseEnumPipe(Roles)) role: string, @Query('uuid', new ParseUUIDPipe(1)) uuid: string): string {
    return `This is a pipe ${id}` + ` UUID is: 🪪 ${uuid}` + `Current Role is: ${role}`;
  }
}

export { AppController };
