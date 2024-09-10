import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class Logger4Interceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        console.log('Before Logger4Interceptor...');
        const now = Date.now();
        return next.handle().pipe(tap(() => {
            console.log(`After Logger4Interceptor... ${Date.now() - now}ms`);
        }));
    }
}