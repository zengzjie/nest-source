import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonService {
  constructor(@Inject("SUFFIX") private suffix: string) {}
  log() {
    return `CommonService ${this.suffix}`;
  }
}
