namespace DSB.StreamBackend.Logging;

/// <summary>
/// Represents an active logging scope.
/// </summary>
public sealed class LoggingScope : IDisposable
{
    private static readonly AsyncLocal<string?> CurrentScope = new();

    private readonly string? _previousScope;

    /// <summary>
    /// Gets the currently active scope.
    /// </summary>
    public static string? Current => CurrentScope.Value;

    /// <summary>
    /// Starts a new logging scope.
    /// </summary>
    public LoggingScope(string scopeName)
    {
        _previousScope = CurrentScope.Value;

        CurrentScope.Value = scopeName;
    }

    /// <summary>
    /// Ends the scope and restores the previous scope.
    /// </summary>
    public void Dispose()
    {
        CurrentScope.Value = _previousScope;
    }
}
