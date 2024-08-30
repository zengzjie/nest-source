import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";

export class ParseIntPipe implements PipeTransform<string> {
  constructor() {}
  async transform(value: string, metadata: ArgumentMetadata) {
    if (isNil(value)) {
      return value;
    }
    if (!this.isNumeric(value)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }
    return parseInt(value, 10);
  }

  /**
   * @param value 当前处理的路由参数
   * @returns 如果 value 是一个有效的整数，则返回true
   */
  protected isNumeric(value: string): boolean {
    return (
      ["string", "number"].includes(typeof value) &&
      /^-?\d+$/.test(value) && isFinite(Number(value))
    );
  }
}
