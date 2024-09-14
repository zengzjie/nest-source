import { Inject, Injectable } from "@nestjs/common";
import { MULTER_MODULE_OPTIONS } from "./files.constants";
import { MulterOptions } from "./interfaces";

@Injectable()
export class MulterService {
    constructor(@Inject(MULTER_MODULE_OPTIONS) private options?: MulterOptions) {}

    getMulterModuleOptions() {
        return this.options;
    }
}