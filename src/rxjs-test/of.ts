// of 是一个创建可观擦对象的函数，它接收任意数量的参数，并将这些参数依次作为数据项发出来
class Observable {
    constructor(private _subscribe) {}
    // 订阅方法，接收一个观察者对象，返回一个取消订阅的函数
    subscribe(observer) {
        // 调用存储的订阅函数，并传入观察者对象
        this._subscribe(observer);
        return () => {
            console.log("unsubscribe");
        }
    }
}

// 定义一个 of 函数, 用于创建包含指定值的可观察对象
function of(...values) {
    return new Observable((observer) => {
        for (const value of values) {
            observer.next(value);
        }
        observer.complete();
    });
}

of(1, 2, 3).subscribe({
    next: (value) => console.log(value),
    error: (error) => console.error(error),
    complete: () => console.log("complete"),
});

export {}
