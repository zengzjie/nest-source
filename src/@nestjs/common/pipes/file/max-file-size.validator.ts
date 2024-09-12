import { FileValidator } from "./file-validator.interface";
import { IFile } from "./interface/file.interface";

export type MaxFileSizeValidatorOptions = {
  maxSize: number;
  message?: string | ((maxSize: number) => string);
};

export class MaxFileSizeValidator extends FileValidator<
  MaxFileSizeValidatorOptions,
  IFile
> {
  isValid(file?: IFile): boolean | Promise<boolean> {
    if (!this.validationOptions || !file) {
      return true;
    }
    return "size" in file && file.size < this.validationOptions.maxSize;
  }
  buildErrorMessage(file: any): string {
    if (this.validationOptions.message) {
      if (typeof this.validationOptions.message === "function") {
        return this.validationOptions.message(this.validationOptions.maxSize);
      } else {
        return this.validationOptions.message as string;
      }
    }
    return `Validation failed (expected size is less than ${this.validationOptions.maxSize})`;
  }
}
