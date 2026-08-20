namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Request body for creating a new API key
/// </summary>
public class CreateApiKeyRequestDto
{
    /// <summary>
    /// Gets or sets the human-readable name of the key (e.g. "Stream Deck")
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the access level of the key (0 = read-only, 1 = read-write)
    /// </summary>
    public int AccessLevel { get; set; }
}
