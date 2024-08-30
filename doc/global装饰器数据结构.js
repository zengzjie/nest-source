// CommonModule 被 @Global 装饰
// @Global()
const CommonModule = {
  providers: [CommonService],
  exports: [CommonService],
};

const OtherModule = {
  providers: [OtherService],
  providers: [OtherService],
};

const AppModule = {
  imports: [CommonModule, OtherModule],
  controllers: [AppController],
};

/**
   Map(1) {
    // key => provider.useValue
    'SUFFIX' => 'custom-suffix',
    DogsService => DogsService { name: 'dog' }
   }
   */
const providerInstances = new Map([
  [DogsService, new DogsService({ name: "dog" })],
  ["SUFFIX", "custom-suffix"],
]);
/**
    Map(1) {
      // Module => Set(1) { token }
    }
      // 使用了 @GLOBAL 装饰的 不会被加入到 moduleProviders 中 
   */
const moduleProviders = new Map([
  AppModule,
  new Set(OtherModule),
  OtherModule,
  new Set(OtherService),
  CommonModule,
  new Set(CommonService),
]);

/**
    Set(1) {
        { token }
    }
 */
const globalProviders = new Set(CommonService);
