import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { BadRequestException } from "../exceptions";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { Injectable } from "../decorators";
import { AppService } from "src/app.service";

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly appServer: AppService) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    if (
      !metadata ||
      !metadata.metatype ||
      !this.toValidate(metadata.metatype)
    ) {
      return value;
    }

    const instance = plainToInstance(metadata.metatype, value);
    const errors = await validate(instance);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
