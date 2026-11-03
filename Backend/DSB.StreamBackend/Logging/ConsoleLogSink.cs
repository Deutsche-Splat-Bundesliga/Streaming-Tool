using System.Text.Json;

namespace DSB.StreamBackend.Logging;

/// <summary>
/// Writes logs to the console using colors
/// based on severity.
/// </summary>
public class ConsoleLogSink : ILogSink
{
    private static readonly object ConsoleLock = new();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false
    };

    /// <inheritdoc />
    public Task WriteAsync(LogEntry entry)
    {
        lock (ConsoleLock)
        {
            var originalColor = Console.ForegroundColor;

            try
            {
                Console.ForegroundColor = GetColor(entry.Level);
                Console.Write($"[{entry.Timestamp:O}] [{entry.Level}] ");

                if (!string.IsNullOrWhiteSpace(entry.Source))
                {
                    Console.ForegroundColor = ConsoleColor.DarkCyan;
                    Console.Write($"[{entry.Source}] ");
                    Console.ForegroundColor = GetColor(entry.Level);
                }

                Console.Write(entry.Message);

                if (entry.Data is not null)
                {
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.Write(" | Data: ");
                    Console.Write(JsonSerializer.Serialize(entry.Data, JsonOptions));
                    Console.ForegroundColor = GetColor(entry.Level);
                }

                if (entry.Exception is not null)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.Write(" | Exception: ");
                    Console.WriteLine(entry.Exception);
                }
                else
                {
                    Console.WriteLine();
                }
            }
            finally
            {
                Console.ForegroundColor = originalColor;
            }
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Returns the console color for a log level.
    /// </summary>
    private static ConsoleColor GetColor(LogLevel level)
        => level switch
        {
            LogLevel.Trace => ConsoleColor.DarkGray,
            LogLevel.Debug => ConsoleColor.Gray,
            LogLevel.Info => ConsoleColor.Green,
            LogLevel.Warning => ConsoleColor.Yellow,
            LogLevel.Error => ConsoleColor.Red,
            LogLevel.Critical => ConsoleColor.Magenta,
            _ => ConsoleColor.White
        };
}