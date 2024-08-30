import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";

export class CustomPipe implements PipeTransform<number> {
  constructor() {}
  async transform(value: number, metadata: ArgumentMetadata) {
    if (isNil(value)) {
      return value;
    }
    return "This is the modified version of the value: " + value;
  }
}
