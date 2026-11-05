namespace DSB.StreamBackend.Logging;

/// <summary>
/// Represents a destination for log entries.
/// </summary>
public interface ILogSink
{
    /// <summary>
    /// Writes a log entry.
    /// </summary>
    Task WriteAsync(LogEntry entry);
}
