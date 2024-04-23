import { getTimestamp } from './time.util';

type LogLevel = 'log' | 'error' | 'warn';

interface ILevelConfiguration {
  colorCode: string;
  levelText: string;
}

const levelConfiguration: Record<LogLevel, ILevelConfiguration> = {
  log: { colorCode: '\x1b[32m', levelText: 'LOG' },
  error: { colorCode: '\x1b[31m', levelText: 'ERROR' },
  warn: { colorCode: '\x1b[35m', levelText: 'WARN' },
};

export function logToConsole(
  level: LogLevel,
  ...optionalParams: string[]
): void {
  const { colorCode, levelText } = levelConfiguration[level];
  const baseMessage = `${applyColor(level, '[jasonsoft/nestjs-seq]')} - \x1b[37m${getTimestamp()}\x1b[39m ${colorCode}${levelText}\x1b[39m \x1b[33m[SeqLogger]\x1b[39m`;
  optionalParams.forEach((item) => {
    console[level](`${baseMessage}`, applyColor(level, item));
  });
}

function applyColor(level: LogLevel, message: string): string {
  const { colorCode } = levelConfiguration[level];
  return `${colorCode}${message}\x1b[39m`;
}
