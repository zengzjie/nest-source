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
  UsePipes,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { Body } from "@nestjs/common";
import { CreateCatDto, createCatSchema } from "./zod/create-cat.dto";
import { ZodValidationPipe } from "./zod/zod-validation.pipe";
import { CreateUserDto } from "./cats/create-user.dto";
import { Roles as SetRoles } from "./user/role";
import { AuthGuard } from "./auth/auth.guard";
import { CreateDecoratorRole } from "./user/create-decorator-role";
import {
  Logger1Interceptor,
  Logger2Interceptor,
  Logger3Interceptor,
  Logger4Interceptor,
} from "./interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "./pipes/file-size-validation.pipe";

enum Roles {
  USER = "user",
  ADMIN = "admin",
}

@Controller()
// @UseInterceptors(Logger3Interceptor)
// @UseInterceptors(Logger4Interceptor)
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
  handlePipe(
    @Param("id", ParseIntPipe, CustomPipe) id: number,
    @Param("role", new ParseEnumPipe(Roles)) role: string,
    @Query(
      "uuid",
      new ParseUUIDPipe({
        version: "3",
      })
    )
    uuid: string
  ): string {
    return (
      `This is a pipe ${id}` +
      ` UUID is: 🪪 ${uuid}` +
      `Current Role is: ${role}`
    );
  }

  @Post("zodCats")
  @UsePipes(new ZodValidationPipe(createCatSchema))
  handleZodiac(@Body() createCatDto: CreateCatDto): string {
    return "this action adds a new cat";
  }

  @Post("createUser")
  handleCreateUser(@Body() createUserDto: CreateUserDto): string {
    return "this action adds a new user";
  }

  @Get("guardsRole")
  // @UseGuards(AuthGuard)
  // @SetRoles("admin", "fairy")
  @CreateDecoratorRole(["admin", "fairy"])
  handleGuardsRole(@Query("role") role: string): string {
    return `Access is only granted with specific roles: ${role}`;
  }

  @Get("interceptorPay")
  @UseInterceptors(Logger1Interceptor)
  @UseInterceptors(Logger2Interceptor)
  handleInterceptorPay(@Query("id", ParseIntPipe) id: number): string {
    console.log(`this is id: ${id}`);

    return `this action is intercepted by PayInterceptor -> ${id}`;
  }

  @Post("upload/file")
  @UseInterceptors(FileInterceptor("file")) // FileInterceptor 作用是把文件信息保存到 req.file
  handleUploadFile(
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File
  ) {
    console.log(
      "\n 🎯-> checked AppController checked handleUploadFile checked file: 📮 --- 📮",
      file
    );
    return {
      originalname: file.originalname,
      size: file.size,
    };
  }

  @Post("upload/file/validate")
  @UseInterceptors(FileInterceptor("file"))
  handleUploadFileValidate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 500, message: (maxSize) => {
            return `File size should not exceed ${maxSize / 1024} KB`;
          } }),
          new FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return {
      originalname: file.originalname,
      size: file.size,
    };
  }
}

export { AppController };
