using DSB.StreamBackend.Logging;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Default implementation of the logging service.
/// </summary>
/// <remarks>
/// Initializes a new logging service.
/// </remarks>
/// <param name="sinks">A list of all sinks to connect to the logging service.</param>
public class LogService(IEnumerable<ILogSink> sinks, IWebHostEnvironment? env = null) : ILogService
{

    /// <summary>
    /// Logs a Trace log.
    /// </summary>
    /// <remarks>
    /// Logs of this type will only be logged in the Development environment.
    /// </remarks>
    /// <param name="message">The log message to display</param>
    /// <param name="data">The object to log</param>
    public Task TraceAsync(string message, object? data = null)
        => LogAsync(Logging.LogLevel.Trace, message, null, data);

    /// <summary>
    /// Logs a Debug log.
    /// </summary>
    /// <remarks>
    /// Logs of this type will only be logged in the Development environment.
    /// </remarks>
    /// <param name="message">The log message to display</param>
    /// <param name="data">The object to log</param>
    public Task DebugAsync(string message, object? data = null)
        => LogAsync(Logging.LogLevel.Debug, message, null, data);

    /// <summary>
    /// Logs an Info log.
    /// </summary>
    /// <param name="message">The log message to display</param>
    /// <param name="data">The object to log</param>
    public Task InfoAsync(string message, object? data = null)
        => LogAsync(Logging.LogLevel.Info, message, null, data);

    /// <summary>
    /// Logs a Warning log.
    /// </summary>
    /// <param name="message">The log message to display</param>
    /// <param name="data">The object to log</param>
    public Task WarningAsync(string message, object? data = null)
        => LogAsync(Logging.LogLevel.Warning, message, null, data);

    /// <summary>
    /// Logs an Error log.
    /// </summary>
    /// <param name="message">The log message to display</param>
    /// <param name="ex">The Exception to log</param>
    public Task ErrorAsync(string message, Exception? ex = null, object? data = null)
        => LogAsync(Logging.LogLevel.Error, message, ex, data);

    /// <summary>
    /// Logs a Critical Error log.
    /// </summary>
    /// <param name="message">The log message to display</param>
    /// <param name="ex">The Exception to log</param>
    public Task CriticalAsync(string message, Exception? ex = null, object? data = null)
        => LogAsync(Logging.LogLevel.Critical, message, ex, data);

    /// <summary>
    /// Writes a log entry to all configured sinks.
    /// </summary>
    private async Task LogAsync(Logging.LogLevel level, string message, Exception? ex, object? data)
    {
        if (!ShouldLog(level)) return;

        LogEntry entry = new()
        {
            Timestamp = DateTime.Now,
            Level = level,
            Message = message,
            Exception = ex,
            Data = data,
            Scope = LoggingScope.Current
        };

        await Task.WhenAll(
            sinks.Select(async x =>
            {
                try
                {
                    await x.WriteAsync(entry);
                }
                catch { }
            })
        );
    }

    /// <inheritdoc />
    public IDisposable BeginScope(string scopeName)
    {
        return new LoggingScope(scopeName);
    }

    /// <summary>
    /// Checks whether the provided log should be logged in the current environment.
    /// </summary>
    /// <param name="level">The log level to log</param>
    /// <returns>True if the log should be logged, otherwise false</returns>
    private bool ShouldLog(Logging.LogLevel level)
    {
        if (env is null || env!.IsDevelopment()) return true;
        return level > Logging.LogLevel.Debug;
    }
}