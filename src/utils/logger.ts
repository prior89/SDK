export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  public static error(message: string, ...args: any[]): void {
    console.error(`[LL][ERROR] ${message}`, ...args);
  }
  public static warn(message: string, ...args: any[]): void {
    console.warn(`[LL][WARN] ${message}`, ...args);
  }
  public static info(message: string, ...args: any[]): void {
    console.info(`[LL][INFO] ${message}`, ...args);
  }
  public static debug(message: string, ...args: any[]): void {
    if (process.env['NODE_ENV'] !== 'production') {
      console.debug(`[LL][DEBUG] ${message}`, ...args);
    }
  }
}