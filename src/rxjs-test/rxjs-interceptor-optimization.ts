import { from, Observable, of } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";

const routerHandle = async () => {
  console.log("pay...");
  return "pay";
};

class Logger1Interceptor {
  async intercept(_, next): Promise<Observable<any>> {
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
  async intercept(_, next): Promise<Observable<any>> {
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
  const nextFn = (i = 0) => {
    if (i >= interceptors.length) {
      const handleResult = routerHandle();
      return handleResult instanceof Promise
        ? from(handleResult)
        : of(handleResult);
    }
    const result = interceptors[i].intercept(null, {
      handle: () => nextFn(i + 1),
    });

    // 支持同步跟异步的返回值
    return from(result).pipe(
      mergeMap((value) => (value instanceof Observable ? value : of(value)))
    );
  };
  return nextFn();
}

executeInterceptor([logger2Interceptor, logger1Interceptor]).subscribe(
  console.log
);

export {};
