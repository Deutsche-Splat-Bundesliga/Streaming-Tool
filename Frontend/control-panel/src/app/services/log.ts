import { Injectable, isDevMode } from '@angular/core';
import { LogScope } from '../models/log-scope';
import { LogLevel } from '../enums/log-level';
import { LogEntry } from '../models/log-entry';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private _scopeStack: string[] = [];

  beginScope(name: string): LogScope {
    this._scopeStack.push(name);

    return {
      dispose: () => {
        this._scopeStack.pop();
      },
    };
  }

  /**
   * Computed property that gets the log scope.
   */
  private get scope(): string | undefined {
    return this._scopeStack.at(-1);
  }

  /**
   * Logs a Trace log
   * @param message {string} The message to log
   * @param data {any} (optional) The data to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace(message: string, data?: any): void {
    this.log(LogLevel.Trace, message, data);
  }

  /**
   * Logs a Debug log
   * @param message {string} The message to log
   * @param data {any} (optional) The data to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, data?: any): void {
    this.log(LogLevel.Debug, message, data);
  }

  /**
   * Logs an Info log
   * @param message {string} The message to log
   * @param data {any} (optional) The data to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, data?: any): void {
    this.log(LogLevel.Info, message, data);
  }

  /**
   * Logs a Warn log
   * @param message {string} The message to log
   * @param data {any} (optional) The data to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, data?: any): void {
    this.log(LogLevel.Warning, message, data);
  }

  /**
   * Logs an Error log
   * @param message {string} The message to log
   * @param error {any} (optional) The error to log
   * @param data {any} (optional) The data to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, error?: any, data?: any): void {
    this.log(LogLevel.Error, message, data, error);
  }

  /**
   * Logs a Critical Error log
   * @param message {string} The message to log
   * @param error {any} The error to log
   * @param data {any} The data to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  critical(message: string, error?: any, data?: any): void {
    this.log(LogLevel.Critical, message, data, error);
  }

  private shouldLog(level: LogLevel): boolean {
    if (isDevMode()) return true;
    return level > LogLevel.Info;
  }

  /**
   * Logs an error with the given Log Level
   * @param level {LogLevel} The log level
   * @param message {string} The message to log
   * @param data {any} (optional) The data to log
   * @param error {any} (optional) The error to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(level: LogLevel, message: string, data?: any, error?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
      scope: this.scope,
    };

    this.writeToConsole(entry);
  }

  /**
   * Writes the provided Log Entry to the console
   * @param entry {LogEntry} The log entry to write to the console
   */
  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${LogLevel[entry.level]}]`;

    switch (entry.level) {
      case LogLevel.Error:
      case LogLevel.Critical:
        console.error(prefix, entry.message, entry);
        break;
      case LogLevel.Warning:
        console.warn(prefix, entry.message, entry);
        break;
      default:
        console.log(prefix, entry.message, entry);
        break;
    }
  }
}
