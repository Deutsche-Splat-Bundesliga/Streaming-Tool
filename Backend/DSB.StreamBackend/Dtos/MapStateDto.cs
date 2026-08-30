namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Represents the current state of a map within the streaming tool.
/// </summary>
public class MapStateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the map state.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display order of the map in the map rotation.
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the map.
    /// </summary>
    public string MapId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the identifier of the game mode for the map.
    /// </summary>
    public string ModeId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the winning team or player for the map, if available.
    /// </summary>
    public string? Winner { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the map is visible in the UI.
    /// </summary>
    public bool IsVisible { get; set; }
}