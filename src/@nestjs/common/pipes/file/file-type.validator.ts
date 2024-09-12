import { FileValidator } from "./file-validator.interface";
import { IFile } from "./interface/file.interface";

export type FileTypeValidatorOptions = {
  fileType: string | RegExp;
};

export class FileTypeValidator extends FileValidator<
  FileTypeValidatorOptions,
  IFile
> {
  isValid(file?: IFile): boolean | Promise<boolean> {
    if (!this.validationOptions) {
      return true;
    }
    return !!file && 'mimetype' in file && !!file.mimetype.match(this.validationOptions.fileType);
  }
  buildErrorMessage(file: any): string {
    return `Validation failed (expected type is ${this.validationOptions.fileType})`;
  }
}
