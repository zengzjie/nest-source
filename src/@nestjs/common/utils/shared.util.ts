import "reflect-metadata";
import { MODULE_METADATA } from "../constants";

const isString = (val) => typeof val === "string";
const isFunction = (val) => typeof val === "function";
const isUndefined = (obj) => typeof obj === "undefined";
const isNil = (val) => isUndefined(val) || val === null;
const isObject = (val) =>
  !isNil(val) && typeof val === "object" && !Array.isArray(val);
const isEmptyObject = (obj) => Object.keys(obj).length === 0;

const isClass = (fn) => {
  if (typeof fn !== "function") {
    return false;
  }
  // 如果是一个类的话，它的原型对象上应该有一个 constructor 属性，这个属性指向这个类本身
  if (fn.prototype === undefined) {
    return true;
  }
  // 如果是一个类的话，它的原型对象上应该有一个 constructor 属性，这个属性指向这个类本身
  return fn.prototype.constructor === fn;
};

const isModule = (val) =>
  isClass(val) && Reflect.getMetadata(MODULE_METADATA.MODULE, val);

/**
 * @ description 检查一个对象是否是“纯粹的对象”，一个“纯粹的对象”是指那些由Object构造函数创建的对象，或者是通过字面量 {} 创建的对象。
 *               具体来说，它不包含自定义构造函数，也不继承于任何自定义的原型链
 * @param fn
 * @returns
 */
const isPlainObject = (fn) => {
  // 首先检查是否是一个对象
  if (!isObject(fn)) {
    return false;
  }
  // 获取对象原型
  const proto = Object.getPrototypeOf(fn);
  // 如果原型为 null，说明是一个纯粹的对象 -> Object.create(null) 创建的对象
  if (proto === null) {
    return true;
  }
  // 检查原型上是否有 constructor 属性，并获取这个构造函数
  const ctor =
    Object.prototype.hasOwnProperty.call(proto, "constructor") &&
    proto.constructor;
  // 构造函数是一个函数，并且构造函数的实例是构造函数本身，并且构造函数的字符串表示与 Object 构造函数的字符串表示相同
  /*
    const obj = {};
    const ctor = obj.constructor;
    console.log(ctor); // [Function: Object]
    console.log(ctor instanceof ctor); // true
    console.log(Function.prototype.toString.call(ctor)); // function Object() { [native code] }
    console.log(Function.prototype.toString.call(Object)); // function Object() { [native code] }
  */
  return (
    typeof ctor === "function" &&
    ctor instanceof ctor &&
    Function.prototype.toString.call(ctor) ===
      Function.prototype.toString.call(Object)
  );
};

export {
  isString,
  isFunction,
  isUndefined,
  isNil,
  isObject,
  isModule,
  isClass,
  isPlainObject,
  isEmptyObject,
};
