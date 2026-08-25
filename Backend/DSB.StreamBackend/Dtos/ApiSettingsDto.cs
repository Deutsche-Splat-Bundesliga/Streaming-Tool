namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Represents the settings that control how the public REST API behaves
/// </summary>
public class ApiSettingsDto
{
    /// <summary>
    /// Gets or sets whether API requests without an API key are allowed
    /// </summary>
    public bool AllowUnauthenticatedRequests { get; set; } = true;
}
