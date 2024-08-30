import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AppService } from "src/app.service";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private appService: AppService) {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log(this.appService.getAppService(), "💬 logger middleware");
    next();
  }
}
