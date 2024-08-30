import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";

export class ParseFloatPipe implements PipeTransform<string> {
  constructor() {}
  async transform(value: string, metadata: ArgumentMetadata) {
    if (isNil(value)) {
      return value;
    }
    if (!this.isNumeric(value)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }
    return parseFloat(value);
  }

  /**
   * @param value 当前处理的路由参数
   * @returns 如果 value 是一个有效的浮点数，则返回true
   */
  protected isNumeric(value: string): boolean {
    return (
      ["string", "number"].includes(typeof value) &&
      !isNaN(parseFloat(value)) && isFinite(Number(value))
    );
  }
}
