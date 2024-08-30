import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator<string>(
  (data, ctx: ExecutionContext) => {
    console.log(data, ctx, "User Decorator");

    const request = ctx.switchToHttp().getRequest();

    // process.nextTick(() => {
    //   console.log(request.user?.[data], "request.user");
    //   return data ? request.user?.[data[0]] : request.user;
    // });
    return "John Doe";
  }
);
