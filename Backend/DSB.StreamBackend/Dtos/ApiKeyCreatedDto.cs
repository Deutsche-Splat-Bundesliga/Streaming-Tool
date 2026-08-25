namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Response returned once when a new API key was created.
/// This is the only time the plaintext key is ever exposed.
/// </summary>
public class ApiKeyCreatedDto
{
    /// <summary>
    /// Gets or sets the plaintext API key. Shown exactly once - it cannot be retrieved again.
    /// </summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the metadata of the created key
    /// </summary>
    public ApiKeyDto ApiKey { get; set; } = new();
}
