//
class Observable {
  constructor(private _subscribe) {}
  // 订阅方法，接收一个观察者对象，返回一个取消订阅的函数
  subscribe(observer) {
    // 调用存储的订阅函数，并传入观察者对象
    this._subscribe(
      typeof observer === "function"
        ? {
            next: observer,
            error: (e) => {},
            complete: () => {console.log("down")},
          }
        : observer
    );
    return () => {
      console.log("unsubscribe");
    };
  }
  pipe(operators) {
    return operators(this);
  }
}

function of(...values) {
  return new Observable((observer) => {
    for (const value of values) {
      observer.next(value);
    }
    observer.complete();
  });
}

function mergeMap(project) {
  // 返回一个可接收源可观察对象的函数
  // source => Observable {...}
  return function (source) {
    return new Observable((observer) => {
      source.subscribe((value) => {
        project(value).subscribe((projectValue) => observer.next(projectValue));
      });
    });
  };
}

of(1, 2, 3)
  .pipe(mergeMap((value) => of(value * 2)))
  .subscribe((value) => console.log(value));

export {};
