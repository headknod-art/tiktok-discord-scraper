/**
 * Logger utility module
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4
};

export class Logger {
  constructor(name, level = 'INFO') {
    this.name = name;
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  _log(level, message, ...args) {
    if (LOG_LEVELS[level] >= this.level) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level}] [${this.name}]`;
      
      switch (level) {
        case 'DEBUG':
          console.debug(prefix, message, ...args);
          break;
        case 'INFO':
          console.info(prefix, message, ...args);
          break;
        case 'WARNING':
          console.warn(prefix, message, ...args);
          break;
        case 'ERROR':
        case 'CRITICAL':
          console.error(prefix, message, ...args);
          break;
      }
    }
  }

  debug(message, ...args) {
    this._log('DEBUG', message, ...args);
  }

  info(message, ...args) {
    this._log('INFO', message, ...args);
  }

  warning(message, ...args) {
    this._log('WARNING', message, ...args);
  }

  error(message, ...args) {
    this._log('ERROR', message, ...args);
  }

  critical(message, ...args) {
    this._log('CRITICAL', message, ...args);
  }
}

export function createLogger(name, level) {
  return new Logger(name, level);
}
