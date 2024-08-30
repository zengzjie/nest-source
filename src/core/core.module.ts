import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { CoreService } from "./core.service";

@Module({
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
