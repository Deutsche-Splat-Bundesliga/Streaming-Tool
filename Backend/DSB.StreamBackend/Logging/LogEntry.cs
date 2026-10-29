namespace DSB.StreamBackend.Logging;

/// <summary>
/// Represents a single log record.
/// </summary>
public class LogEntry
{
    /// <summary>
    /// Gets or sets when the log was created.
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the log severity.
    /// </summary>
    public LogLevel Level { get; set; }

    /// <summary>
    /// Gets or sets the log message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the source file and line where the log was created.
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the associated exception.
    /// </summary>
    public Exception? Exception { get; set; }

    /// <summary>
    /// Gets or sets additional structured data.
    /// </summary>
    public object? Data { get; set; }

    /// <summary>
    /// Gets or sets the active scope.
    /// </summary>
    public string? Scope { get; set; }

    /// <summary>
    /// Gets or sets the correlation identifier.
    /// </summary>
    public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
}