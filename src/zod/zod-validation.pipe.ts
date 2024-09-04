import { PipeTransform } from "@nestjs/common";
import { ArgumentMetadata } from "@nestjs/common/interfaces";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema) {}
    transform(value: any, metadata: ArgumentMetadata) {
        try {
            // 将传递进来的值使用 ZodSchema 进行解析和验证后，如果通过则返回解析后的值
            return this.schema.parse(value);
        } catch (error) {
            const errorMessage = error.errors.map(err => `${err.path[0]}` + ' ' + err.message).join(', ');
            // 记录错误信息日志
            console.log(errorMessage, "❌ zod-validation.pipe.ts ======> error");
            // 如果验证失败，则抛出异常
            throw new Error('服务器内部错误，请联系管理员！');
        }
    }
}