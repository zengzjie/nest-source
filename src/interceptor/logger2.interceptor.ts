import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class Logger2Interceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        console.log('Before Logger2Interceptor...');
        const now = Date.now();
        return next.handle().pipe(map(data => {
            console.log(`After Logger2Interceptor... ${Date.now() - now}ms`);
            return data + ' pay';
        }));
    }
}