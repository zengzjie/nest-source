// from 是一个创建可观擦对象的函数，可以接收各种可迭代对象（数组、Promise、迭代器）等，并把它们转化为可观察对象
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
function from(input) {
    return new Observable((observer) => {
        if (input instanceof Promise && input.then instanceof Function) {
            input.then((value) => {
                observer.next(value);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        } else {
            for (const value of input) {
                observer.next(value);
            }
            observer.complete();
        }
    });
}

from([1, 2, 3]).subscribe({
    next: (value) => console.log(value),
    error: (error) => console.error(error),
    complete: () => console.log("complete"),
});

from(Promise.reject("错误")).subscribe({
    next: (value) => console.log(value),
    error: (error) => console.error(error),
    complete: () => console.log("complete"),
});

export {}
