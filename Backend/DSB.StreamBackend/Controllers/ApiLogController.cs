using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Controllers;

/// <summary>
/// Controller that exposes the in-memory API request log of the current session.
/// </summary>
/// <param name="requestLog">The in-memory session log of API requests.</param>
/// <param name="hub">SignalR hub context for notifying Control Panel clients of log changes.</param>
[ApiController]
[Route("api/api-log")]
public class ApiLogController(
    ApiRequestLog requestLog,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log) : ControllerBase
{
    /// <summary>
    /// Retrieves all API log entries of the current backend session, oldest first.
    /// </summary>
    /// <returns>The list of log entries.</returns>
    [HttpGet]
    public ActionResult<List<ApiLogEntryDto>> GetLog()
    {
        using IDisposable scope = log.BeginScope(nameof(GetLog));

        _ = log.DebugAsync("GET /api/api-log called");

        return Ok(requestLog.GetEntries());
    }

    /// <summary>
    /// Clears the API log and notifies all connected Control Panel clients.
    /// </summary>
    /// <returns>204 on success.</returns>
    [HttpDelete]
    public async Task<IActionResult> ClearLog()
    {
        using IDisposable scope = log.BeginScope(nameof(ClearLog));

        _ = log.InfoAsync("DELETE /api/api-log called");

        requestLog.Clear();

        await hub.Clients.All.ApiLogCleared();

        return NoContent();
    }
}
