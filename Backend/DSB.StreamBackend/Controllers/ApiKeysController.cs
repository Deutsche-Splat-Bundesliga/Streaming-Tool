using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Controllers;

/// <summary>
/// Controller that exposes API key management endpoints (list, create, revoke).
/// </summary>
/// <param name="keyService">Service used to manage API keys.</param>
/// <param name="hub">SignalR hub context for notifying Control Panel clients of key changes.</param>
[ApiController]
[Route("api/api-keys")]
public class ApiKeysController(
    ApiKeyService keyService,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log) : ControllerBase
{
    /// <summary>
    /// Retrieves all issued API keys (metadata only, never the keys themselves).
    /// </summary>
    /// <returns>The list of issued API keys.</returns>
    [HttpGet]
    public async Task<ActionResult<List<ApiKeyDto>>> GetKeys()
    {
        using IDisposable scope = log.BeginScope(nameof(GetKeys));

        _ = log.DebugAsync("GET /api/api-keys called");

        try
        {
            List<ApiKeyDto> keys = await keyService.GetKeysAsync();

            _ = log.InfoAsync("API keys returned", new { Count = keys.Count });

            return Ok(keys);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to retrieve API keys", ex);
            throw;
        }
    }

    /// <summary>
    /// Creates a new API key and notifies all connected Control Panel clients.
    /// The response contains the plaintext key exactly once - it cannot be retrieved again.
    /// </summary>
    /// <param name="request">Name and access level for the new key.</param>
    /// <returns>The created key including its plaintext value.</returns>
    [HttpPost]
    public async Task<ActionResult<ApiKeyCreatedDto>> CreateKey(CreateApiKeyRequestDto request)
    {
        using IDisposable scope = log.BeginScope(nameof(CreateKey));

        _ = log.InfoAsync("POST /api/api-keys called", new { request.Name, request.AccessLevel });

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "The API key name must not be empty." });
        }

        try
        {
            ApiKeyCreatedDto createdKey = await keyService.CreateKeyAsync(request);

            await hub.Clients.All.ApiKeysUpdated(await keyService.GetKeysAsync());

            _ = log.InfoAsync("API key created and key list pushed to SignalR clients");

            return Ok(createdKey);
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to create API key", ex);
            throw;
        }
    }

    /// <summary>
    /// Deletes (revokes) an API key and notifies all connected Control Panel clients.
    /// </summary>
    /// <param name="id">The id of the key to delete.</param>
    /// <returns>204 if the key was deleted, 404 if it does not exist.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteKey(string id)
    {
        using IDisposable scope = log.BeginScope(nameof(DeleteKey));

        _ = log.InfoAsync("DELETE /api/api-keys called", new { id });

        try
        {
            bool deleted = await keyService.DeleteKeyAsync(id);

            if (!deleted)
            {
                return NotFound(new { error = "No API key with this id exists." });
            }

            await hub.Clients.All.ApiKeysUpdated(await keyService.GetKeysAsync());

            _ = log.InfoAsync("API key deleted and key list pushed to SignalR clients");

            return NoContent();
        }
        catch (Exception ex)
        {
            _ = log.ErrorAsync("Failed to delete API key", ex);
            throw;
        }
    }
}
