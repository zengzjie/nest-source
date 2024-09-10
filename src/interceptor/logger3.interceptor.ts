import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class Logger3Interceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        console.log('Before Logger3Interceptor...');
        const now = Date.now();
        return next.handle().pipe(tap(() => {
            console.log(`After Logger3Interceptor... ${Date.now() - now}ms`);
        }));
    }
}