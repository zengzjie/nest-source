import { DynamicModule, Module } from "@nestjs/common";
import { DogsService } from "src/cats/cats.service";
import { GlobalService } from "src/global.service";

@Module({
  providers: [
    {
      //   provide: "PREFIX",
      //   useValue: "PREFIX",
      provide: DogsService,
      useClass: DogsService,
    },
  ],
  exports: [DogsService],
})
export class CreateDynamicModule {
  static forRoot(
    options: Record<string, any>
  ): DynamicModule | Promise<DynamicModule> {
    const providers = [
      {
        provide: "FOOT",
        useValue: options.apiKey,
      },
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          module: CreateDynamicModule,
          providers,
          exports: ["FOOT"],
        });
      }, 3000);
    });
    // return {
    //   module: CreateDynamicModule,
    //   providers,
    //   exports: ["FOOT"],
    // };
  }
}
