/**
 * @see [Middleware](https://docs.nestjs.com/middleware)
 *
 */
export interface NestMiddleware<TRequest = any, TResponse = any> {
  use(req: TRequest, res: TResponse, next: (error?: Error | any) => void): any;
}
