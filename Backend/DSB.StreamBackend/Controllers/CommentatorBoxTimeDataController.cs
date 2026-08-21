using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Controllers;

/// <summary>
/// Controller that exposes commentator box time data endpoints for retrieval and updates.
/// </summary>
/// <param name="timeDataService">Service used to retrieve and update time data.</param>
/// <param name="hub">SignalR hub context for notifying overlay clients of time data changes.</param>
[ApiController]
[Route("api/commentator-box-time-data")]
public class CommentatorBoxTimeDataController(
    CommentatorBoxTimeDataService timeDataService,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log) : ControllerBase
{
    /// <summary>
    /// Retrieves the current commentator box time data.
    /// </summary>
    /// <returns>The current commentator box time data.</returns>
    [HttpGet("commentator-box-time-data")]
    public async Task<ActionResult<CommentatorBoxTimeDataDto>> GetCommentatorBoxTimeData()
    {
        using IDisposable scope = log.BeginScope(nameof(GetCommentatorBoxTimeData));

        _ = log.DebugAsync("GET commentator-box-time-data requested");

        CommentatorBoxTimeDataDto timeData = await timeDataService.GetCommentatorBoxTimeDataAsync();

        _ = log.InfoAsync("Commentator box time data retrieved");

        return Ok(timeData);
    }

    /// <summary>
    /// Updates the commentator box time data and notifies all connected overlay clients of the change.
    /// </summary>
    /// <param name="timeData">The new commentator box time data to apply.</param>
    /// <returns>The updated commentator box time data.</returns>
    [HttpPost("commentator-box-time-data")]
    public async Task<ActionResult<CommentatorBoxTimeDataDto>> UpdateCommentatorBoxTimeData(
        CommentatorBoxTimeDataDto timeData)
    {
        using IDisposable scope = log.BeginScope(nameof(UpdateCommentatorBoxTimeData));

        _ = log.InfoAsync("Updating CommentatorBoxTimeData: {@TimeData}", timeData);

        CommentatorBoxTimeDataDto updatedTimeData = await timeDataService.UpdateCommentatorBoxTimeDataAsync(timeData);

        _ = log.InfoAsync("CommentatorBoxTimeData updated successfully: {@UpdatedTimeData}", updatedTimeData);

        await hub.Clients.All.CommentatorBoxTimeDataUpdated(updatedTimeData);

        _ = log.InfoAsync("Broadcasted CommentatorBoxTimeData update to all clients.");

        return Ok(updatedTimeData);
    }
}
