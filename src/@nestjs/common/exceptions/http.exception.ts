import { HttpStatus } from "@nestjs/common";
import { isObject, isString } from "../utils/shared.util";

export class HttpException extends Error {
    private readonly response;
    private readonly status;
    constructor(response: string | Record<string, any>, status: HttpStatus) {
        super();
        this.response = response;
        this.status = status;
        this.initMessage();
        this.initName();
    }

    initMessage() {
        if (isString(this.response)) {
            this.message = this.response;
        } else if (isObject(this.response) && isString(this.response.message)) {
            this.message = this.response.message
        } else if (this.constructor) {
            // 确保当前实例的构造函数存在的情况下，从构造函数的名称中提取出默认的错误信息
            this.message = this.constructor.name.match(/[A-Z][a-z]+|[0-9]+/g).join(' ') ?? 'Error';
        }
    };

    initName(): string {
        return this.constructor.name;
    };

    getResponse(): string | object {
        return this.response;
    };

    getStatus(): HttpStatus {
        return this.status;
    }
}

export class BadRequestException extends HttpException {
    constructor(response: string | Record<string, any>) {
        super(response, HttpStatus.BAD_REQUEST);
    }
}

export class UnauthorizedException extends HttpException {
    constructor(response: string | Record<string, any>) {
        super(response, HttpStatus.UNAUTHORIZED);
    }
}

export class ForbiddenException extends HttpException {
    constructor(response: string | Record<string, any>) {
        super(response, HttpStatus.FORBIDDEN);
    }
}

export class NotFoundException extends HttpException {
    constructor(response: string | Record<string, any>) {
        super(response, HttpStatus.NOT_FOUND);
    }
}

export class RequestTimeoutException extends HttpException {
    constructor(response: string | Record<string, any>) {
        super(response, HttpStatus.REQUEST_TIMEOUT);
    }
}

export class BadGateWayException extends HttpException {
    constructor(response: string | Record<string, any>) {
        super(response, HttpStatus.BAD_GATEWAY);
    }
}
