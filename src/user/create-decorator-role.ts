import { Reflector } from "@nestjs/core";

export const CreateDecoratorRole = Reflector.createDecorator<string[]>()