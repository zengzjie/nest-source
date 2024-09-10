import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

const next = {
  handle: () => {
    console.log("💰 paying...");
    return of("pay");
  },
};

class Logger1Interceptor {
  intercept(_, next): Observable<any> {
    console.log("Logger1Interceptor before");
    const now = new Date();
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `Logger1Interceptor after ${new Date().getTime() - now.getTime()}ms`
          )
        )
      );
  }
}

class Logger2Interceptor {
  intercept(_, next): Observable<any> {
    console.log("Logger2Interceptor before");
    const now = new Date();
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `Logger2Interceptor after ${new Date().getTime() - now.getTime()}ms`
          )
        )
      );
  }
}

const logger1Interceptor = new Logger1Interceptor();
const logger2Interceptor = new Logger2Interceptor();

/**
 * @description: 🧅洋葱模型, 外层执行开始后一直往里面执行完最终在执行外层最后的回调
 * @param {*} interceptors
 * @return {*}
 */
function executeInterceptor(interceptors): Observable<any> {
  let currentHandle = () => next.handle();
  for (let i = 0; i <= interceptors.length - 1; i++) {
    const currentInterceptor = interceptors[i];
    const nextHandle = currentHandle;
    currentHandle = () =>
      currentInterceptor.intercept(null, { handle: nextHandle });
  }

  return currentHandle();
}

executeInterceptor([logger1Interceptor, logger2Interceptor]).subscribe(
  console.log
);

// logger1Interceptor.intercept(null, next).subscribe(console.log);
// logger2Interceptor.intercept(null, next).subscribe(console.log);

export {};
