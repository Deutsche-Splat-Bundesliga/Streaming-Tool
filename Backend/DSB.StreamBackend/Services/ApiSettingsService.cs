using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Contains all business logic related to the API settings
/// </summary>
/// <param name="db">The database context</param>
public class ApiSettingsService(StreamToolDbContext db, ILogService log)
{
    /// <summary>
    /// Asynchronously gets the API settings
    /// </summary>
    /// <returns>A <see cref="Task"/> object returning an <see cref="ApiSettingsDto"/></returns>
    public async Task<ApiSettingsDto> GetSettingsAsync()
    {
        using IDisposable scope = log.BeginScope(nameof(GetSettingsAsync));

        await log.DebugAsync("Loading API settings");

        try
        {
            ApiSettingsEntity entity = await GetOrCreateSettingsAsync();

            return ToDto(entity);
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to load API settings", ex);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously updates the API settings
    /// </summary>
    /// <param name="dto">The <see cref="ApiSettingsDto"/> containing the updated information</param>
    /// <returns>The updated <see cref="ApiSettingsDto"/> object</returns>
    public async Task<ApiSettingsDto> UpdateSettingsAsync(ApiSettingsDto dto)
    {
        using IDisposable scope = log.BeginScope(nameof(UpdateSettingsAsync));

        await log.InfoAsync("Updating API settings", new
        {
            dto.AllowUnauthenticatedRequests
        });

        try
        {
            ApiSettingsEntity entity = await GetOrCreateSettingsAsync();

            entity.AllowUnauthenticatedRequests = dto.AllowUnauthenticatedRequests;

            await db.SaveChangesAsync();

            await log.InfoAsync("API settings updated", new
            {
                entity.AllowUnauthenticatedRequests
            });

            return ToDto(entity);
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to update API settings", ex, dto);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously gets or creates the API settings
    /// </summary>
    /// <returns>The <see cref="ApiSettingsEntity"/></returns>
    private async Task<ApiSettingsEntity> GetOrCreateSettingsAsync()
    {
        await log.TraceAsync("Loading API settings entity");

        ApiSettingsEntity? entity = await db.ApiSettings.FirstOrDefaultAsync(x => x.Id == 1);

        if (entity is not null)
        {
            await log.TraceAsync("API settings entity exists");
            return entity;
        }

        await log.WarningAsync("API settings not found, creating default");

        entity = new ApiSettingsEntity
        {
            Id = 1
        };

        db.ApiSettings.Add(entity);

        await db.SaveChangesAsync();

        await log.InfoAsync("Created API settings");

        return entity;
    }

    /// <summary>
    /// Converts the <see cref="ApiSettingsEntity"/> to an <see cref="ApiSettingsDto"/>
    /// </summary>
    /// <param name="entity">The <see cref="ApiSettingsEntity"/> to convert</param>
    /// <returns>The resulting <see cref="ApiSettingsDto"/></returns>
    private static ApiSettingsDto ToDto(ApiSettingsEntity entity)
    {
        return new ApiSettingsDto
        {
            AllowUnauthenticatedRequests = entity.AllowUnauthenticatedRequests
        };
    }
}
