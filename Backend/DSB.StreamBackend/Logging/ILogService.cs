namespace DSB.StreamBackend.Logging;

/// <summary>
/// Provides centralized application logging functionality.
/// </summary>
public interface ILogService
{
    /// <summary>
    /// Writes a trace message.
    /// </summary>
    Task TraceAsync(string message, object? data = null);

    /// <summary>
    /// Writes a debug message.
    /// </summary>
    Task DebugAsync(string message, object? data = null);

    /// <summary>
    /// Writes an informational message.
    /// </summary>
    Task InfoAsync(string message, object? data = null);

    /// <summary>
    /// Writes a warning message.
    /// </summary>
    Task WarningAsync(string message, object? data = null);

    /// <summary>
    /// Writes an error message.
    /// </summary>
    Task ErrorAsync(string message, Exception? ex = null, object? data = null);

    /// <summary>
    /// Writes a critical failure message.
    /// </summary>
    Task CriticalAsync(string message, Exception? ex = null, object? data = null);

    /// <summary>
    /// Begins a logical logging scope.
    /// </summary>
    IDisposable BeginScope(string scopeName);
}
