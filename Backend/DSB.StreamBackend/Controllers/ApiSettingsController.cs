using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Controllers;

/// <summary>
/// Controller that exposes the API settings for retrieval and updates.
/// </summary>
/// <param name="settingsService">Service used to retrieve and update the API settings.</param>
/// <param name="hub">SignalR hub context for notifying Control Panel clients of settings changes.</param>
[ApiController]
[Route("api/api-settings")]
public class ApiSettingsController(
    ApiSettingsService settingsService,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log) : ControllerBase
{
    /// <summary>
    /// Retrieves the current API settings.
    /// </summary>
    /// <returns>The current API settings.</returns>
    [HttpGet]
    public async Task<ActionResult<ApiSettingsDto>> GetSettings()
    {
        using IDisposable scope = log.BeginScope(nameof(GetSettings));

        _ = log.DebugAsync("GET /api/api-settings called");

        try
        {
            ApiSettingsDto settings = await settingsService.GetSettingsAsync();

            _ = log.InfoAsync("API settings returned");

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to retrieve API settings", ex);
            throw;
        }
    }

    /// <summary>
    /// Updates the API settings and notifies all connected Control Panel clients of the change.
    /// </summary>
    /// <param name="settings">The new API settings to apply.</param>
    /// <returns>The updated API settings.</returns>
    [HttpPost]
    public async Task<ActionResult<ApiSettingsDto>> UpdateSettings(ApiSettingsDto settings)
    {
        using IDisposable scope = log.BeginScope(nameof(UpdateSettings));

        _ = log.InfoAsync("POST /api/api-settings called", new
        {
            settings.AllowUnauthenticatedRequests
        });

        try
        {
            ApiSettingsDto updatedSettings = await settingsService.UpdateSettingsAsync(settings);

            await hub.Clients.All.ApiSettingsUpdated(updatedSettings);

            _ = log.InfoAsync("API settings pushed to SignalR clients");

            return Ok(updatedSettings);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to update API settings", ex, settings);
            throw;
        }
    }
}
