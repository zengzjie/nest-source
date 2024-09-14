import { DynamicModule, Module } from "@nestjs/common";
import { MulterModuleOptions } from "./interfaces/files-upload-module.interface";
import { MULTER_MODULE_OPTIONS } from "./files.constants";
import { MulterService } from "./multer.service";

@Module({})
export class MulterModule {
  static register(options?: MulterModuleOptions): DynamicModule {
    return {
      module: MulterModule,
      providers: [
        {
          provide: MULTER_MODULE_OPTIONS,
          useFactory: () => options ?? {},
        },
        MulterService
      ],
      exports: [MulterService],
    };
  }
}
