using DSB.StreamBackend.Enums;

namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Represents an issued API key as shown in the Control Panel.
/// Never contains the plaintext key or its hash.
/// </summary>
public class ApiKeyDto
{
    /// <summary>
    /// Unique identifier of the key
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the human-readable name of the key
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the first characters of the plaintext key for display purposes
    /// </summary>
    public string KeyPrefix { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the access level of the key
    /// </summary>
    public ApiKeyAccessLevel AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets when the key was created (UTC)
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the key was last used (UTC), or null if never used
    /// </summary>
    public DateTime? LastUsedAt { get; set; }
}
