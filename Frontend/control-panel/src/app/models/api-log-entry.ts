/**
 * Represents a single API request in the in-memory session log.
 */
export interface ApiLogEntry {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  source: string;
  wasRejected: boolean;
}
