import { isFunction, isPlainObject, isString } from "@nestjs/common";
import { isLogLevelEnabled } from "@nestjs/common/services/utils";
import clc from "cli-color";
import { isUndefined } from "../utils/shared.util";

type LogLevel = "log" | "error" | "warn" | "debug" | "verbose" | "fatal";

export interface ConsoleLoggerOptions {
  /**
   * Enabled log levels.
   */
  logLevels?: LogLevel[];
  /**
   * If enabled, will print timestamp (time difference) between current and previous log message.
   */
  timestamp?: boolean;
}

const DEFAULT_LOG_LEVELS = [
  "log",
  "error",
  "warn",
  "debug",
  "verbose",
  "fatal",
] as LogLevel[];

// 用于将日期和时间对象格式化为特定的字符串表示形式
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric", // 年份以数字形式显示
  hour: "numeric", // 小时以数字形式显示
  minute: "numeric", // 分钟以数字形式显示
  second: "numeric", // 秒以数字形式显示
  day: "2-digit", // 日期以两位数字形式显示
  month: "2-digit", // 月份以两位数字形式显示
});

let lastTimestampAt: number;

class Logger {
  protected context: string;
  protected options: ConsoleLoggerOptions;
  protected originalContext: string;
  constructor();
  constructor(context?: string);
  constructor(context?: string, options?: ConsoleLoggerOptions);
  constructor(context?: string, options?: ConsoleLoggerOptions) {
    this.context = context || "";
    this.options = options || {
      // 默认打印时间戳
      timestamp: true,
    };

    if (!this.options.logLevels) {
      this.options.logLevels = DEFAULT_LOG_LEVELS;
    }

    if (this.context) {
      this.originalContext = this.context;
    }
  }

  // private static lastTimestampAt: number;

  static log(message: string, ...optionalParams) {
    const logger = new Logger();
    if (!logger.isLevelEnabled("log")) {
      return;
    }
    const { messages, context } = logger.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    logger.printMessages(messages, context, "log");
  }

  log(message: string, ...optionalParams) {
    if (!this.isLevelEnabled("log")) {
      return;
    }
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    this.printMessages(messages, context, "log");
  }

  static error(message: string, ...optionalParams) {
    const logger = new Logger();
    if (!logger.isLevelEnabled("error")) {
      return;
    }
    const { messages, context, stack } =
      logger.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);

    logger.printMessages(messages, context, "error", "stderr");
    logger.printStackTrace(stack);
  }

  error(message: string, ...optionalParams) {
    if (!this.isLevelEnabled("error")) {
      return;
    }
    const { messages, context, stack } =
      this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);

    this.printMessages(messages, context, "error", "stderr");
    this.printStackTrace(stack);
  }

  /**
   * @description: 判断是否是一个堆栈格式
   * @param {*} stack
   * @return {*}
   */
  isStackFormat(stack) {
    if (!isString(stack) && !isUndefined(stack)) {
      return false;
    }
    return /^(.)+\n\s+at .+:\d+:\d+/.test(stack);
  }

  printStackTrace(stack) {
    if (!stack) {
      return;
    }
    process.stderr.write(`${stack}\n`);
  }

  /**
   * @description: 获取要打印的上下文和消息
   * @param {*} args
   * @return {*}
   */
  getContextAndMessagesToPrint(args) {
    if (args?.length <= 1) {
      return { messages: args, context: this.context };
    }
    // 获取最后一个参数
    const lastElement = args[args.length - 1];
    // 判断最后一个参数是否是字符串
    const isContext = isString(lastElement);
    // 如果不是字符串，直接返回
    if (!isContext) {
      return { messages: args, context: this.context };
    }
    // 如果是字符串，返回上下文和消息
    return {
      context: lastElement,
      messages: args.slice(0, args.length - 1),
    };
  }

  getContextAndStackAndMessagesToPrint(args) {
    if (args.length === 2) {
      return this.isStackFormat(args[1])
        ? {
            messages: [args[0]],
            stack: args[1],
            context: this.context,
          }
        : {
            messages: [args[0]],
            context: args[1],
          };
    }
    const { messages, context } = this.getContextAndMessagesToPrint(args);
    if (messages?.length <= 1) {
      return { messages, context };
    }
    const lastElement = messages[messages.length - 1];
    const isStack = isString(lastElement);
    // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
    if (!isStack && !isUndefined(lastElement)) {
      return { messages, context };
    }
    return {
      stack: lastElement,
      messages: messages.slice(0, messages.length - 1),
      context,
    };
  }

  /**
   * @description: 已经启用的日志级别
   * @param {*} level 日志级别
   * @return {*} 是否已经启用
   */
  isLevelEnabled(level) {
    const logLevels = this.options?.logLevels;
    return isLogLevelEnabled(level, logLevels);
  }

  /**
   * @description: 获取时间戳
   * @return {*} 时间戳
   */
  getTimestamp() {
    return dateTimeFormatter.format(Date.now());
  }

  /**
   * @description: 打印消息，将消息写入到流中展示
   * @return {*}
   */
  printMessages(
    messages: string[],
    context = "",
    logLevel = "log",
    writeStreamType?
  ) {
    messages.forEach((message) => {
      const pidMessage = this.formatPid(process.pid);
      const contextMessage = this.formatContext(context);
      const timestampDiff = this.updateAndGetTimestampDiff();
      const formattedLogLevel = logLevel.toUpperCase().padStart(7, " ");
      const formattedMessage = this.formatMessage(
        logLevel,
        message,
        pidMessage,
        formattedLogLevel,
        contextMessage,
        timestampDiff
      );
      // 根据 writeStreamType 写入到不同的流中
      process[writeStreamType ?? "stdout"].write(formattedMessage);
    });
  }

  formatPid(pid) {
    return `[Nest] ${pid}  - `;
  }

  formatContext(context) {
    return context ? clc.yellow(`[${context}] `) : "";
  }

  /**
   * @description: 更新并获取时间戳差异
   * @return {*}
   */
  updateAndGetTimestampDiff() {
    // 如果上一次的时间戳存在，并且配置了时间戳 -> 应用程序刚启动时，Logger.lastTimestampAt 为 undefined
    const includeTimestamp = lastTimestampAt && this.options.timestamp;
    const result = includeTimestamp
      ? this.formattedTimestampDiff(Date.now() - lastTimestampAt)
      : "";

    // 更新时间戳
    lastTimestampAt = Date.now();
    return result;
  }

  /**
   * @description: 格式化时间戳差异
   * @param {*} timestampDiff
   * @return {*}
   */
  formattedTimestampDiff(timestampDiff) {
    return clc.yellow(`+${timestampDiff}ms`);
  }

  /**
   * @description: 格式化消息
   * @return {*}
   */
  formatMessage(
    logLevel,
    message,
    pidMessage,
    formattedLogLevel,
    contextMessage,
    timestampDiff
  ) {
    const output = this.stringifyMessage(message, logLevel);
    pidMessage = this.colorize(pidMessage, logLevel);
    formattedLogLevel = this.colorize(formattedLogLevel, logLevel);
    return `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output} ${timestampDiff}\n`;
  }

  /**
   * @description: 将消息转换为字符串
   * @param {*} message
   * @param {*} logLevel
   * @return {*}
   */
  stringifyMessage(message, logLevel) {
    if (isFunction(message)) {
      // 拿到函数的字符串形式
      const messageAsStr = Function.prototype.toString.call(message);
      // 判断是否是类
      const isClass = messageAsStr.startsWith("class ");
      if (isClass) {
        // 如果消息是一个类，我们将显示类名。
        return this.stringifyMessage(message.name, logLevel);
      }
      // 如果消息是非类函数，请调用它并重新解析其值。
      return this.stringifyMessage(message(), logLevel);
    }
    // 如果消息是一个纯粹对象或数组，我们将使用 JSON.stringify() 方法将其转换为字符串。
    return isPlainObject(message) || Array.isArray(message)
      ? `${this.colorize("Object:", logLevel)}\n${JSON.stringify(
          message,
          (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2
        )}\n`
      : this.colorize(message, logLevel);
  }

  colorize(message, logLevel) {
    const color = this.getColorByLogLevel(logLevel);
    return color(message);
  }

  getColorByLogLevel(level) {
    switch (level) {
      case "debug":
        return clc.magentaBright;
      case "warn":
        return clc.yellow;
      case "error":
        return clc.red;
      case "verbose":
        return clc.cyanBright;
      case "fatal":
        return clc.bold;
      default:
        return clc.green;
    }
  }
}

export { Logger };
