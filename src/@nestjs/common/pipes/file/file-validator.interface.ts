import { IFile } from "./interface/file.interface";

export abstract class FileValidator<
  TValidationOptions = Record<string, any>,
  TFile extends IFile = IFile
> {
  constructor(protected readonly validationOptions: TValidationOptions) {}
  /**
   * 根据构造函数中传递的选项，指示此文件是否应被视为有效。
   * @param file 请求对象中的文件
   */
  abstract isValid(
    file?: TFile | TFile[] | Record<string, TFile[]>
  ): boolean | Promise<boolean>;
  /**
   * 如果验证失败，则生成错误消息
   * @param file 请求对象中的文件
   */
  abstract buildErrorMessage(file: any): string;
}
