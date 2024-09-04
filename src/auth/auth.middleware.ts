import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        req.user = { empCode: 674384753990, username: "jack", roles: [req.query.role ?? ''] };
        next();
    }
}