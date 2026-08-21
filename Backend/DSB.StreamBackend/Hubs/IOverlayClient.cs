using DSB.StreamBackend.Dtos;

namespace DSB.StreamBackend.Hubs;

/// <summary>
/// Defines client-side overlay callbacks that can be invoked from the server.
/// </summary>
public interface IOverlayClient
{
    /// <summary>
    /// Sends an updated broadcast state to connected overlay clients.
    /// </summary>
    /// <param name="state">The latest broadcast state data.</param>
    Task BroadcastStateUpdated(BroadcastStateDto state);

    /// <summary>
    /// Sends updated socials to connected overlay clients.
    /// </summary>
    /// <param name="socials">The latest socials data.</param>
    Task SocialsUpdated(SocialsDto socials);

    /// <summary>
    /// Sends updated commentator box time data to connected overlay clients.
    /// </summary>
    /// <param name="timeData">The latest commentator box time data.</param>
    Task CommentatorBoxTimeDataUpdated(CommentatorBoxTimeDataDto timeData);

    /// <summary>
    /// Sends updated API settings to connected clients (Control Panel).
    /// </summary>
    /// <param name="settings">The latest API settings.</param>
    Task ApiSettingsUpdated(ApiSettingsDto settings);

    /// <summary>
    /// Sends the updated list of issued API keys to connected clients (Control Panel).
    /// </summary>
    /// <param name="keys">The current list of API keys.</param>
    Task ApiKeysUpdated(List<ApiKeyDto> keys);

    /// <summary>
    /// Sends a new API log entry to connected clients (Control Panel).
    /// </summary>
    /// <param name="entry">The log entry describing the handled API request.</param>
    Task ApiLogEntryAdded(ApiLogEntryDto entry);

    /// <summary>
    /// Notifies connected clients (Control Panel) that the API log was cleared.
    /// </summary>
    Task ApiLogCleared();
}
