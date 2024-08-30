import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CatsService {
  constructor(@Inject("SUFFIX") private suffix: string) {
    this.suffix = suffix + "😻 New Bad";
  }

  eat() {
    return `${this.suffix} Cats eat fish!`;
  }
}

@Injectable()
export class DogsService {
  constructor(@Inject("SUFFIX") private suffix: string) {}

  eat() {
    console.log(this.suffix, "this.suffix");

    return `${this.suffix} Dogs eat bone!`;
  }
}

@Injectable()
export class FishService {
  constructor() {}

  eat() {
    return "Fish eat feed!";
  }
}

@Injectable()
export class PigService {
  constructor(private prefix) {}

  eat() {
    return `${this.prefix} Pig sleep!`;
  }
}

@Injectable()
export class UseFactory {
  constructor(private arg1, private arg2) {}

  log() {
    return `${this.arg1} This is a Factory! ${this.arg2}`;
  }
}
