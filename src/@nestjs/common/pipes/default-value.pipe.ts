import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";

export class DefaultValuePipe<T = any> implements PipeTransform<T> {
  constructor(private readonly defaultValue: T) {}
  async transform(value: T, metadata: ArgumentMetadata) {
    if (isNil(value)) {
      return value;
    }
    return value ?? this.defaultValue;
  }
}
