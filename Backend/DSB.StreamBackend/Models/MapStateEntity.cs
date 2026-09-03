namespace DSB.StreamBackend.Models;

/// <summary>
/// Represents the persisted state for a single map entry within a broadcast or streaming sequence.
/// </summary>
public class MapStateEntity
{
    /// <summary>
    /// Unique identifier for the map state entity.
    /// </summary>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Display order of the map in the map rotation or broadcast list.
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Identifier for the map.
    /// </summary>
    public string MapId { get; set; } = string.Empty;

    /// <summary>
    /// Identifier for the game mode associated with the map.
    /// </summary>
    public string ModeId { get; set; } = string.Empty;

    /// <summary>
    /// Name of the winning team or player for this map, if available.
    /// </summary>
    public string? Winner { get; set; }

    /// <summary>
    /// Whether the map state should be shown in the broadcast or overlay.
    /// </summary>
    public bool IsVisible { get; set; } = true;

    /// <summary>
    /// Foreign key linking to the parent broadcast state entity.
    /// </summary>
    public int BroadcastStateEntityId { get; set; }

    /// <summary>
    /// Navigation property for the related broadcast state.
    /// </summary>
    public BroadcastStateEntity? BroadcastState { get; set; }
}