export type LogLevel =
  | 'verbose'
  | 'debug'
  | 'info'
  | 'log'
  | 'warn'
  | 'error'
  | 'fatal';

export const LOG_LEVELS_VALUES: Record<LogLevel, number> = {
  verbose: 0,
  debug: 1,
  info: 2,
  log: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};
