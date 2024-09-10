import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class Logger1Interceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        console.log('Before Logger1Interceptor...');
        const now = Date.now();
        return next.handle().pipe(tap(() => {
            console.log(`After Logger1Interceptor... ${Date.now() - now}ms`);
        }));
    }
}