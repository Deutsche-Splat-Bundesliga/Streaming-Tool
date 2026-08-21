namespace DSB.StreamBackend.Models;

/// <summary>
/// Represents the settings that control how the public REST API behaves
/// </summary>
public class ApiSettingsEntity
{
    /// <summary>
    /// Gets or sets the single identifier for the API settings
    /// </summary>
    public int Id { get; set; } = 1;

    /// <summary>
    /// Gets or sets whether API requests without an API key are allowed.
    /// Defaults to true because the tool is intended to run on localhost only.
    /// </summary>
    public bool AllowUnauthenticatedRequests { get; set; } = true;
}
