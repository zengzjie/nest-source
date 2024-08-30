
import 'reflect-metadata';
import { Type, Abstract, CATCH_WATERMARK, FILTER_CATCH_EXCEPTIONS } from '@nestjs/common';

export function Catch(...exceptions: Array<Type<any> | Abstract<any>>): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(CATCH_WATERMARK, true, target);
        Reflect.defineMetadata(FILTER_CATCH_EXCEPTIONS, exceptions, target);
    }
}
