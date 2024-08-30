const LOG_LEVEL_VALUES = {
  verbose: 0,
  debug: 1,
  log: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

/**
 * 检查目标级别是否已启用。
 * @param targetLevel 目标级别
 * @param logLevels 已启用日志级别的阵列
 */
const isLogLevelEnabled = (targetLevel, logLevels) => {
  if (!logLevels || (Array.isArray(logLevels) && logLevels?.length === 0)) {
    return false;
  }
  if (logLevels.includes(targetLevel)) {
    return true;
  }
  // 获取最高日志级别的值
  const highestLogLevelValue = logLevels
    .map((level) => LOG_LEVEL_VALUES[level])
    .sort((a, b) => b - a)?.[0];
  // 获取目标级别的值
  const targetLevelValue = LOG_LEVEL_VALUES[targetLevel];
  // 检查目标级别是否已启用
  return targetLevelValue >= highestLogLevelValue;
};

export { isLogLevelEnabled };
