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
/// <param name="socialsService">Service used to retrieve and update socials.</param>
/// <param name="hub">SignalR hub context for notifying overlay clients of socials changes.</param>
[ApiController]
[Route("api/socials")]
public class SocialsController(
    SocialsService socialsService,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log) : ControllerBase
{

    /// <summary>
    /// Retrieves the current socials.
    /// </summary>
    /// <returns>The current socials.</returns>
    [HttpGet("socials")]
    public async Task<ActionResult<BroadcastStateDto>> GetSocials()
    {
        using IDisposable scope = log.BeginScope(nameof(GetSocials));

        _ = log.DebugAsync("GET /api/socials/socials requested");

        SocialsDto socials = await socialsService.GetSocialsAsync();

        _ = log.InfoAsync("Socials retrieved successfully");

        return Ok(socials);
    }

    /// <summary>
    /// Updates the socials and notifies all connected overlay clients of the change.
    /// </summary>
    /// <param name="socials">The new socials to apply.</param>
    /// <returns>The updated socials.</returns>
    [HttpPost("socials")]
    public async Task<ActionResult<SocialsDto>> UpdateSocials(
        SocialsDto socials)
    {
        using IDisposable scope = log.BeginScope(nameof(UpdateSocials));

        _ = log.InfoAsync("POST /api/socials/socials received", new
        {
            HasXHandle = !string.IsNullOrWhiteSpace(socials.XHandle),
            HasDiscordInvite = !string.IsNullOrWhiteSpace(socials.DiscordInvite)
        });

        SocialsDto updatedSocials = await socialsService.UpdateSocialsAsync(socials);

        _ = log.DebugAsync("Broadcasting socials update via SignalR");

        await hub.Clients.All.SocialsUpdated(updatedSocials);

        _ = log.InfoAsync("Socials broadcast completed");

        return Ok(updatedSocials);
    }
}
