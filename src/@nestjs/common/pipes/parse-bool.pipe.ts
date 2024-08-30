import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";

export class ParseBoolPipe implements PipeTransform<string | boolean, Promise<boolean>> {
  async transform(value: string | boolean, metadata: ArgumentMetadata): Promise<boolean> {
    if (isNil(value)) {
      return !!value;
    }
    if (this.isTrue(value)) {
      return true;
    }
    if (this.isFalse(value)) {
      return false;
    }
    throw new BadRequestException('Validation failed (boolean string is expected)');
  }

  /**
   * @param value 当前处理的路由参数
   * @returns
   */
  protected isTrue(value: string | boolean): boolean {
    return value === true || value === 'true';
  }

  protected isFalse(value: string | boolean): boolean {
    return value === false || value === 'false';
  }
}
