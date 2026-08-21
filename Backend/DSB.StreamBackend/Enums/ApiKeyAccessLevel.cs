namespace DSB.StreamBackend.Enums;

/// <summary>
/// Defines what an API key is allowed to do.
/// </summary>
public enum ApiKeyAccessLevel
{
    /// <summary>
    /// The key may only perform read (GET) requests.
    /// </summary>
    ReadOnly,

    /// <summary>
    /// The key may perform read and write requests.
    /// </summary>
    ReadWrite
}
