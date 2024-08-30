import { Injectable } from "@nestjs/common";

@Injectable()
export class GlobalService {
  constructor() {}

  log() {
    console.log("🤡GlobalService");
    return `GlobalService`;
  }
}
