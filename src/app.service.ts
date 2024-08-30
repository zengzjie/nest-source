import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getAppService(): string {
    return "Hello App Service Nest!";
  }
}