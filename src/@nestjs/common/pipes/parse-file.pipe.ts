import { ArgumentMetadata, BadRequestException, isEmpty, isEmptyObject, isObject, isUndefined, PipeTransform } from "@nestjs/common";
import { ParseFileOptions } from "./file";
import { FileValidator } from "./file/file-validator.interface";

export class ParseFilePipe implements PipeTransform {
    constructor(private options?: ParseFileOptions) {}
    async transform(value: any, metadata: ArgumentMetadata) {
        const areThereAnyFilesIn = this.thereAreNoFilesIn(value);
        if (areThereAnyFilesIn) {
            throw new BadRequestException('File is required');
        }
        if (!areThereAnyFilesIn && this.options.validators.length) {
            return await this.validateFilesOrFile(value);
        }
    }

    async validateFilesOrFile(value) {
        if (Array.isArray(value)) {
            return await Promise.all(value.map(file => this.validate(file)));
        } else {
            return await this.validate(value);
        }
    }

    thereAreNoFilesIn(value) {
        const isEmptyArray = Array.isArray(value) && isEmpty(value);
        const isEmptyObject = isObject(value) && isEmpty(Object.keys(value));
        return isUndefined(value) || isEmptyArray || isEmptyObject;
    }

    async validate(file) {
        for (const validator of this.options.validators) {
            await this.validateOrThrow(file, validator)
        }
        return file;
    }

    async validateOrThrow(file, validator: FileValidator) {
        const isValid = await validator.isValid(file);
        if (!isValid) {
            const errorMessage = validator.buildErrorMessage(file);
            throw new BadRequestException(errorMessage);
        }
    }
}