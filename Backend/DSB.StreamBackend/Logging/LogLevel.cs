namespace DSB.StreamBackend.Logging;

/// <summary>
/// Contains all possible log levels
/// </summary>
public enum LogLevel
{
    /// <summary>
    /// Represents a Trace log, and is only shown when running in Development environment
    /// </summary>
    Trace,

    /// <summary>
    /// Represents a Debug log, and is only shown when running in Development environment
    /// </summary>
    Debug,

    /// <summary>
    /// Represents an Info log
    /// </summary>
    Info,

    /// <summary>
    /// Represents a Warning log
    /// </summary>
    Warning,

    /// <summary>
    /// Represents an Error log
    /// </summary>
    Error,

    /// <summary>
    /// Represents a Critical Error log
    /// </summary>
    Critical,
}
