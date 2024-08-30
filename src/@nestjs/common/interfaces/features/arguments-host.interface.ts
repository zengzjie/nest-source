export type ContextType = "http" | "ws" | "rpc";
/**
 * 获取请求和响应对象的方法
 */
export interface HttpArgumentsHost {
  /**
   * 返回飞行中的“请求”对象
   */
  getRequest<T = any>(): T;
  /**
   * 返回飞行中的“响应”对象
   */
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

/**
 * 获取WebSocket数据和客户端对象的方法
 */
export interface WsArgumentsHost {
  /**
   * 返回数据对象
   */
  getData<T = any>(): T;
  /**
   * 返回客户端对象
   */
  getClient<T = any>(): T;
  /**
   * 返回事件的模式
   */
  getPattern(): string;
}

export interface ArgumentsHost {
  /**
   * 将上下文切换到HTTP
   * @returns 与检索HTTP参数的方法接口
   */
  switchToHttp(): HttpArgumentsHost;
  /**
   * 将上下文切换到WebSockets
   * @returns 与检索WebSockets参数的方法的接口
   */
  switchToWs(): WsArgumentsHost;
  /**
   * 返回当前执行上下文类型（字符串）
   */
  getType<TContext extends string = ContextType>(): TContext;
}
