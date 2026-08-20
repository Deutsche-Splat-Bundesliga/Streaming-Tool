/**
 * Enum that is used for setting which signalr connection listener to subscribe to for each service
 */
export enum SignalrServiceConnection {
  None = 0,
  BroadcastState,
  Socials,
  CommentatorBoxTimeData,
  Api,
  Max,
}
