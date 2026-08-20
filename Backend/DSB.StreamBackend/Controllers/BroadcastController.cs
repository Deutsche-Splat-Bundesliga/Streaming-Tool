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

        try
        {
            BroadcastStateDto state = await stateService.GetStateAsync();
            _ = log.InfoAsync("Broadcast state returned");
            return Ok(state);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to retrieve broadcast state", ex);
            throw;
        }
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

        try
        {
            BroadcastStateDto updatedState = await stateService.UpdateStateAsync(state);
            await hub.Clients.All.BroadcastStateUpdated(updatedState);
            _ = log.InfoAsync("Broadcast state pushed to SignalR clients");
            return Ok(updatedState);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to update broadcast state", ex, state);
            throw;
        }
    }

    /// <summary>
    /// Increments the score of a team by one and notifies all connected overlay clients.
    /// Convenience endpoint for third-party integrations (e.g. Stream Deck) - a single
    /// POST without body instead of a full get-modify-post cycle.
    /// </summary>
    /// <param name="team">The team whose score to increment ("alpha" or "bravo").</param>
    /// <returns>The updated broadcast state.</returns>
    [HttpPost("score/increment")]
    public Task<ActionResult<BroadcastStateDto>> IncrementScore([FromQuery] string team)
        => ChangeScore(team, +1);

    /// <summary>
    /// Decrements the score of a team by one (never below zero) and notifies all connected
    /// overlay clients. Convenience endpoint for third-party integrations (e.g. Stream Deck).
    /// </summary>
    /// <param name="team">The team whose score to decrement ("alpha" or "bravo").</param>
    /// <returns>The updated broadcast state.</returns>
    [HttpPost("score/decrement")]
    public Task<ActionResult<BroadcastStateDto>> DecrementScore([FromQuery] string team)
        => ChangeScore(team, -1);

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

    /// <summary>
    /// Applies a score delta to the given team and broadcasts the updated state.
    /// </summary>
    /// <param name="team">The team whose score to change ("alpha" or "bravo").</param>
    /// <param name="delta">The score delta to apply.</param>
    /// <returns>The updated broadcast state.</returns>
    private async Task<ActionResult<BroadcastStateDto>> ChangeScore(string team, int delta)
    {
        using IDisposable scope = log.BeginScope(nameof(ChangeScore));

        _ = log.InfoAsync("POST /api/broadcast/score change called", new { team, delta });

        try
        {
            BroadcastStateDto state = await stateService.GetStateAsync();

            switch (team?.ToLowerInvariant())
            {
                case "alpha":
                    state.ScoreAlpha = Math.Max(0, state.ScoreAlpha + delta);
                    break;
                case "bravo":
                    state.ScoreBravo = Math.Max(0, state.ScoreBravo + delta);
                    break;
                default:
                    return BadRequest(new { error = "Unknown team. Use 'alpha' or 'bravo'." });
            }

            BroadcastStateDto updatedState = await stateService.UpdateStateAsync(state);
            await hub.Clients.All.BroadcastStateUpdated(updatedState);

            _ = log.InfoAsync("Score changed and pushed to SignalR clients", new
            {
                team,
                updatedState.ScoreAlpha,
                updatedState.ScoreBravo
            });

            return Ok(updatedState);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to change score", ex, new { team, delta });
            throw;
        }
    }
}