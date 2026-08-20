using System.Net;

namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Represents a single API request in the in-memory session log
/// </summary>
public class ApiLogEntryDto
{
    /// <summary>
    /// Gets or sets when the request was handled (UTC)
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the HTTP method of the request (e.g. "GET")
    /// </summary>
    public string Method { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the request path (e.g. "/api/broadcast/state")
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the HTTP status code the request was answered with
    /// </summary>
    public HttpStatusCode StatusCode { get; set; }

    /// <summary>
    /// Gets or sets who issued the request:
    /// "Control Panel", the name of the API key used, or "Anonym"
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the request was rejected by the API authentication (401/403)
    /// </summary>
    public bool WasRejected { get; set; }
}
