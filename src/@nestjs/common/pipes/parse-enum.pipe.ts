import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";

export class ParseEnumPipe<T = any> implements PipeTransform<T> {
  constructor(private readonly enumType: T) {
    if (!enumType) {
      throw new Error('"ParseEnumPipe" requires "enumType" argument specified (to validate input values).');
    }
  }
  async transform(value: T, metadata: ArgumentMetadata) {
    if (isNil(value)) {
      return value;
    }
    if (!this.isEnum(value)) {
      throw new BadRequestException('Validation failed (enum string is expected)');
    }
    return value;
  }

  /**
   * @param value 当前处理的路由参数
   * @returns 满足当前 enumType 的值
   */
  protected isEnum(value: T): boolean {
    const enumValues = Object.values(this.enumType);
    return enumValues.includes(value);
  };
}
