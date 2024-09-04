import { BadRequestException } from "../exceptions";
import { ArgumentMetadata, PipeTransform } from "../interfaces";
import { isNil } from "../utils/shared.util";
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export interface ParseUUIDPipeOptions {
  version?: '3' | '4' | '5' | '7';
}

export class ParseUUIDPipe implements PipeTransform<string> {
  constructor(private readonly options: ParseUUIDPipeOptions) {}
  async transform(uuid: string, metadata: ArgumentMetadata) {
    if (isNil(uuid)) {
      return uuid;
    }
    if (!this.uuidValidateAndVersion(uuid)) {
      throw new BadRequestException('Validation failed (UUID string is expected)');
    };

    return uuid;
  }

  private uuidValidateAndVersion(uuid: string): boolean {
    return uuidValidate(uuid) && uuidVersion(uuid) === this.options.version;
  }
}
