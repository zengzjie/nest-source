import { Injectable } from "@nestjs/common";
import { GlobalService } from "src/global.service";

@Injectable()
export class CoreService {
  constructor(private globalLog: GlobalService) {}

  log() {
    console.log(this.globalLog, "🤡CoreService");
    return this.globalLog.log();
  }
}
