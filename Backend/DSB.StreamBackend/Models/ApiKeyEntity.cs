using DSB.StreamBackend.Enums;

namespace DSB.StreamBackend.Models;

/// <summary>
/// Represents an issued API key. Only a SHA-256 hash of the key is persisted;
/// the plaintext key is shown to the user exactly once at creation time.
/// </summary>
public class ApiKeyEntity
{
    /// <summary>
    /// Unique identifier for the API key entity.
    /// </summary>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Gets or sets the human-readable name of the key (e.g. "Stream Deck").
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the first characters of the plaintext key (e.g. "stt_ab12cd34"),
    /// stored so the key can still be recognized in the UI after creation.
    /// </summary>
    public string KeyPrefix { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the SHA-256 hash (lowercase hex) of the plaintext key.
    /// </summary>
    public string KeyHash { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the access level of the key.
    /// </summary>
    public int AccessLevel { get; set; } = (int)ApiKeyAccessLevel.ReadWrite;

    /// <summary>
    /// Gets or sets when the key was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the key was last used to authenticate a request (UTC),
    /// or null if it has never been used.
    /// </summary>
    public DateTime? LastUsedAt { get; set; }
}
