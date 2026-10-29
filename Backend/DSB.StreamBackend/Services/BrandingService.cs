using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Reads and updates the persisted organization branding profile.
/// </summary>
public class BrandingService(StreamToolDbContext db, ILogService log)
{
    public async Task<BrandingDto> GetBrandingAsync()
    {
        using IDisposable scope = log.BeginScope(nameof(GetBrandingAsync));

        try
        {
            BrandingEntity entity = await GetBrandingEntityAsync();
            return ToDto(entity);
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to load branding", ex);
            throw;
        }
    }

    public async Task<BrandingDto> UpdateBrandingAsync(BrandingDto dto)
    {
        using IDisposable scope = log.BeginScope(nameof(UpdateBrandingAsync));

        try
        {
            BrandingEntity entity = await GetBrandingEntityAsync();
            entity.OrganizationName = dto.OrganizationName;
            entity.OrganizationShortName = dto.OrganizationShortName;
            entity.TournamentName = dto.TournamentName;
            entity.LogoUrl = dto.LogoUrl;
            entity.LargeLogoUrl = dto.LargeLogoUrl;
            entity.OutlineLogoUrl = dto.OutlineLogoUrl;
            entity.PrimaryColor = dto.PrimaryColor;
            entity.SecondaryColor = dto.SecondaryColor;

            await db.SaveChangesAsync();
            await log.InfoAsync("Branding updated");

            return ToDto(entity);
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to update branding", ex, dto);
            throw;
        }
    }

    private async Task<BrandingEntity> GetBrandingEntityAsync()
    {
        BrandingEntity? entity = await db.Branding.FirstOrDefaultAsync(x => x.Id == 1);
        if (entity is not null)
        {
            return entity;
        }

        entity = new BrandingEntity { Id = 1 };
        db.Branding.Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    private static BrandingDto ToDto(BrandingEntity entity) => new()
    {
        OrganizationName = entity.OrganizationName,
        OrganizationShortName = entity.OrganizationShortName,
        TournamentName = entity.TournamentName,
        LogoUrl = entity.LogoUrl,
        LargeLogoUrl = entity.LargeLogoUrl,
        OutlineLogoUrl = entity.OutlineLogoUrl,
        PrimaryColor = entity.PrimaryColor,
        SecondaryColor = entity.SecondaryColor
    };
}
