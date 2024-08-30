import { Param } from "@nestjs/common";
import {
  Controller,
  Get,
  Post,
  HttpCode,
  Redirect,
  Header,
  Req,
  Request,
  Res,
  Response,
  Next,
  Query,
  Headers,
  Ip,
  Session,
  Body,
} from "@nestjs/common";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { User } from "./decorator/user.decorator";

@Controller("user")
class UserController {
  // 使用 Get 装饰器标记 index 方法为 HTTP, GET 路由处理程序
  @Get("index")
  handleRequest(
    @Req() req: ExpressRequest,
    @Request() request: ExpressRequest
  ): string {
    return "User Index";
  }

  @Get("query")
  handleQuery(
    @Query() query: any,
    age: number,
    @Query("id") id: string
  ): string {
    return `User Query: ${JSON.stringify(query)} ${id}`;
  }

  @Get("headers")
  handleHeaders(
    @Headers() headers: any,
    age: number,
    @Headers("accept") accept: string
  ): string {
    return `User Query: ${JSON.stringify(headers)} \n\n Accept: ${accept}`;
  }

  @Get("ip")
  handleIp(@Ip() ip: string): string {
    return `Your IP: ${ip}`;
  }

  @Get("Session")
  handleSession(@Session() session: any): string {
    if (session.views) {
      session.views++;
    } else {
      session.views = 1;
    }
    return `Your Session: ${JSON.stringify(session.views)}`;
  }

  @Get(":username/param/:orderId")
  handleParam(
    @Param() param: any,
    age: number,
    @Param("username") username: string,
    @Param("orderId") orderId: string
  ): string {
    console.log(param, "param");
    console.log(username, "username");
    console.log(orderId, "orderId");

    return `User Param: ${JSON.stringify(param)} ${username} ${orderId}`;
  }

  @Get("ab*de")
  handleWildcardRoute(): string {
    return "This route user a wildcard";
  }

  @Post("create")
  @HttpCode(200)
  @Redirect("https://nestjs.com", 301)
  @Header("Cache-Control", "none")
  @Header("X-dragon-headers", "dragon")
  createUser(
    @Body() createUserDto,
    @Body("username") username: string
  ): string {
    console.log("createUserDto", createUserDto);
    console.log("username", username);

    return "This action adds a new user";
  }

  @Get("res")
  handleResponse(
    @Res() res: ExpressResponse,
    args: any,
    @Response() response: ExpressResponse
  ): void {
    res.send("Custom response");
  }

  @Get("passthrough")
  handlePassthrough(@Res({ passthrough: true }) res: ExpressResponse): string {
    res.setHeader("custom-key", "custom-value");
    return "Custom passthrough";
  }

  @Get("next")
  handleNext(@Next() next) {
    console.log(next, "next");
    next();
  }

  @Get("redirect")
  @Redirect("https://nestjs.com", 301)
  handleRedirect() {}

  @Get("redirect1")
  handleRedirect1(@Query("version") version: string) {
    return { url: `https://docs.nestjs.com/${version}/`, statusCode: 301 };
  }

  @Get("customParamFactory")
  handleCustomParamFactory(
    @Ip() ip: string,
    @User("firstName") firstName: string,
    @Req() req: any
  ) {
    req.user = {
      firstName: "John",
      lastName: "Doe",
    };

    return `Custom Param Factory: ${firstName}`;
  }
}

export { UserController };
