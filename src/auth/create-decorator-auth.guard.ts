import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Request, Response } from 'express';
import { CreateDecoratorRole } from "src/user/create-decorator-role";

@Injectable()
export class CreateDecoratorAuth implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const classRoles = this.reflector.get<string[]>(CreateDecoratorRole, context.getClass()) ?? [];
        const methodRoles = this.reflector.get<string[]>(CreateDecoratorRole, context.getHandler()) ?? [];
        const mergeRoles = [...classRoles, ...methodRoles];
        if (mergeRoles.length === 0) {
            return true;
        }
        
        // 通过鉴权中间件来为 request.user 赋值用户信息，然后守卫中获取到用户对呀的角色信息，在重 SetMetadata 中拿到设置的角色进行匹配
        return this.matchRoles(mergeRoles, request.user.roles);
    }
    
    protected matchRoles(mergeRoles, userRoles): boolean {
        return mergeRoles.some(role => userRoles.includes(role));
    }
}