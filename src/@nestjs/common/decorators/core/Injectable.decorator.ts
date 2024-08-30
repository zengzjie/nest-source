import { INJECTABLE_WATERMARK } from "@nestjs/common/constants";
import "reflect-metadata";

export function Injectable(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
  };
}
