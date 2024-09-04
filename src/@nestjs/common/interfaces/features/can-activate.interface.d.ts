import { ExecutionContext } from "./execution-context.interface";

export interface CanActivate {
    /**
     * @param context 当前执行上下文。提供对以下详细信息的访问
     *
     * @returns 指示是否允许当前请求继续的值。
     * 
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}