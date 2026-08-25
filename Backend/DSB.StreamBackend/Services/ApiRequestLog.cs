using DSB.StreamBackend.Dtos;

namespace DSB.StreamBackend.Services;

/// <summary>
/// In-memory ring buffer holding the API requests of the current backend session.
/// Registered as a singleton; the log is intentionally not persisted and is empty after a restart.
/// </summary>
public class ApiRequestLog
{
    /// <summary>
    /// Maximum number of entries kept in the buffer. Oldest entries are dropped first.
    /// </summary>
    public const int MaxEntries = 200;

    private readonly Lock _lock = new();

    private readonly Queue<ApiLogEntryDto> _entries = new();

    /// <summary>
    /// Adds an entry to the log, dropping the oldest entry when the buffer is full
    /// </summary>
    /// <param name="entry">The <see cref="ApiLogEntryDto"/> to add</param>
    public void Add(ApiLogEntryDto entry)
    {
        lock (_lock)
        {
            _entries.Enqueue(entry);

            while (_entries.Count > MaxEntries)
            {
                _entries.Dequeue();
            }
        }
    }

    /// <summary>
    /// Gets a snapshot of all log entries, oldest first
    /// </summary>
    /// <returns>A list of <see cref="ApiLogEntryDto"/>s</returns>
    public List<ApiLogEntryDto> GetEntries()
    {
        lock (_lock)
        {
            return [.. _entries];
        }
    }

    /// <summary>
    /// Removes all entries from the log
    /// </summary>
    public void Clear()
    {
        lock (_lock)
        {
            _entries.Clear();
        }
    }
}
