import { LogLevel } from '../enums/log-level';

/**
 * Defines a log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scope?: any;
}
