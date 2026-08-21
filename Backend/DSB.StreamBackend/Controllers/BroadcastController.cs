using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Controllers;

/// <summary>
/// Controller that exposes broadcast state endpoints for retrieval and updates.
/// </summary>
/// <param name="stateService">Service used to retrieve and update broadcast state.</param>
/// <param name="hub">SignalR hub context for notifying overlay clients of state changes.</param>
[ApiController]
[Route("api/broadcast")]
public class BroadcastController(
    BroadcastStateService stateService,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log) : ControllerBase
{

    /// <summary>
    /// Retrieves the current broadcast state.
    /// </summary>
    /// <returns>The current broadcast state.</returns>
    [HttpGet("state")]
    public async Task<ActionResult<BroadcastStateDto>> GetState()
    {
        using IDisposable scope = log.BeginScope(nameof(GetState));

        _ = log.DebugAsync("GET /api/broadcast/state called");

        BroadcastStateDto state = await stateService.GetStateAsync();

        _ = log.InfoAsync("Broadcast state returned");

        return Ok(state);
    }

    /// <summary>
    /// Updates the broadcast state and notifies all connected overlay clients of the change.
    /// </summary>
    /// <param name="state">The new broadcast state to apply.</param>
    /// <returns>The updated broadcast state.</returns>
    [HttpPost("state")]
    public async Task<ActionResult<BroadcastStateDto>> UpdateState(
        BroadcastStateDto state)
    {
        using var scope = log.BeginScope(nameof(UpdateState));

        _ = log.InfoAsync("POST /api/broadcast/state called", new
        {
            state.TeamAlphaName,
            state.TeamBravoName,
            state.ScoreAlpha,
            state.ScoreBravo
        });

        BroadcastStateDto updatedState = await stateService.UpdateStateAsync(state);
        await hub.Clients.All.BroadcastStateUpdated(updatedState);

        _ = log.InfoAsync("Broadcast state pushed to SignalR clients");

        return Ok(updatedState);
    }

    /// <summary>
    /// Sets the winner of a single map and notifies all connected overlay clients.
    /// The team score is derived from the map winners, so this recomputes both scores
    /// from all maps. Convenience endpoint for third-party integrations (e.g. Stream Deck) -
    /// a single POST instead of a full get-modify-post cycle.
    /// </summary>
    /// <param name="mapId">The id of the map whose winner to set.</param>
    /// <param name="winner">The winner to set: "alpha", "bravo", or "none"/"null"/empty to clear it.</param>
    /// <returns>The updated broadcast state.</returns>
    [HttpPost("maps/{mapId}/winner")]
    public async Task<ActionResult<BroadcastStateDto>> SetMapWinner(
        string mapId,
        [FromQuery] string? winner)
    {
        using IDisposable scope = log.BeginScope(nameof(SetMapWinner));

        _ = log.InfoAsync("POST /api/broadcast/maps/{id}/winner called", new { mapId, winner });

        if (!TryParseWinner(winner, out string? normalizedWinner))
        {
            return BadRequest(new
            {
                error = "Unknown winner. Use 'alpha', 'bravo', or 'none' (also 'null'/empty) to clear it."
            });
        }

        try
        {
            BroadcastStateDto state = await stateService.GetStateAsync();

            MapStateDto? map = state.Maps.FirstOrDefault(x => x.Id == mapId);

            if (map is null)
            {
                _ = log.WarningAsync("Map not found", new { mapId });
                return NotFound(new { error = "No map with this id exists." });
            }

            map.Winner = normalizedWinner;

            // The score is derived from the map winners, mirroring the Control Panel.
            state.ScoreAlpha = state.Maps.Count(x => x.Winner == "alpha");
            state.ScoreBravo = state.Maps.Count(x => x.Winner == "bravo");

            BroadcastStateDto updatedState = await stateService.UpdateStateAsync(state);
            await hub.Clients.All.BroadcastStateUpdated(updatedState);

            _ = log.InfoAsync("Map winner set and pushed to SignalR clients", new
            {
                mapId,
                winner = normalizedWinner,
                updatedState.ScoreAlpha,
                updatedState.ScoreBravo
            });

            return Ok(updatedState);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to set map winner", ex, new { mapId, winner });
            throw;
        }
    }

    /// <summary>
    /// Normalizes the winner query value to the stored representation
    /// ("alpha", "bravo", or null), rejecting unknown values.
    /// </summary>
    /// <param name="winner">The raw winner query value.</param>
    /// <param name="normalizedWinner">The normalized winner ("alpha", "bravo", or null).</param>
    /// <returns>True if the value was valid, otherwise false.</returns>
    private static bool TryParseWinner(string? winner, out string? normalizedWinner)
    {
        switch (winner?.Trim().ToLowerInvariant())
        {
            case "alpha":
                normalizedWinner = "alpha";
                return true;
            case "bravo":
                normalizedWinner = "bravo";
                return true;
            case null:
            case string.Empty:
            case "none":
            case "null":
                normalizedWinner = null;
                return true;
            default:
                normalizedWinner = null;
                return false;
        }
    }

    /// <summary>
    /// Toggles the visibility of an overlay element and notifies all connected overlay clients.
    /// Convenience endpoint for third-party integrations (e.g. Stream Deck).
    /// </summary>
    /// <param name="element">The overlay element to toggle
    /// ("map-screen", "score-box", "commentator-box" or "info-box").</param>
    /// <returns>The updated broadcast state.</returns>
    [HttpPost("visibility/{element}/toggle")]
    public async Task<ActionResult<BroadcastStateDto>> ToggleVisibility(string element)
    {
        using IDisposable scope = log.BeginScope(nameof(ToggleVisibility));

        _ = log.InfoAsync("POST /api/broadcast/visibility toggle called", new { element });

        try
        {
            BroadcastStateDto state = await stateService.GetStateAsync();

            switch (element.ToLowerInvariant())
            {
                case "map-screen":
                    state.ShowMapScreen = !state.ShowMapScreen;
                    break;
                case "score-box":
                    state.ShowScoreBox = !state.ShowScoreBox;
                    break;
                case "commentator-box":
                    state.ShowCommentatorBox = !state.ShowCommentatorBox;
                    break;
                case "info-box":
                    state.ShowInfobox = !state.ShowInfobox;
                    break;
                default:
                    return BadRequest(new
                    {
                        error = "Unknown element. Use 'map-screen', 'score-box', 'commentator-box' or 'info-box'."
                    });
            }

            BroadcastStateDto updatedState = await stateService.UpdateStateAsync(state);
            await hub.Clients.All.BroadcastStateUpdated(updatedState);

            _ = log.InfoAsync("Visibility toggled and pushed to SignalR clients", new { element });

            return Ok(updatedState);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to toggle visibility", ex, element);
            throw;
        }
    }
}
