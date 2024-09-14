import { BadRequestException, PipeTransform } from "@nestjs/common";
import { ArgumentMetadata } from "@nestjs/common/interfaces";

export class FileSizeValidationPipe implements PipeTransform {
    transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
        const maxSize = 1024 * 1024 * 3;
        if (value.size > maxSize) {
            throw new BadRequestException('File size is too large');
        };
        return value;
    }
}