using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Contains all business logic related to socials
/// </summary>
/// <param name="db">The database context</param>
/// <param name="log">The logging service</param>
public class SocialsService(StreamToolDbContext db, ILogService log)
    : SingletonEntityService<SocialsEntity, SocialsDto>(db, log)
{
    /// <inheritdoc />
    protected override string EntityName => "socials";

    /// <inheritdoc />
    protected override DbSet<SocialsEntity> DbSet => Db.Socials;

    /// <inheritdoc />
    protected override object? GetLogData(SocialsEntity entity) => new
    {
        HasXHandle = !string.IsNullOrWhiteSpace(entity.XHandle),
        HasDiscordInvite = !string.IsNullOrWhiteSpace(entity.DiscordInvite)
    };

    /// <summary>
    /// Asynchronously gets the socials
    /// </summary>
    /// <returns>A <see cref="Task"/> object returning a <see cref="SocialsDto"/></returns>
    public Task<SocialsDto> GetSocialsAsync() => GetAsync();

    /// <summary>
    /// Asynchronously updates the socials
    /// </summary>
    /// <param name="dto">The <see cref="SocialsDto"/> containing the updated information</param>
    /// <returns>The updated <see cref="SocialsDto"/> object</returns>
    public Task<SocialsDto> UpdateSocialsAsync(SocialsDto dto) => UpdateAsync(dto);

    /// <inheritdoc />
    protected override void Apply(SocialsEntity entity, SocialsDto dto)
    {
        entity.XHandle = dto.XHandle;
        entity.DiscordInvite = dto.DiscordInvite;
    }

    /// <inheritdoc />
    protected override SocialsDto ToDto(SocialsEntity entity)
    {
        return new SocialsDto
        {
            XHandle = entity.XHandle,
            DiscordInvite = entity.DiscordInvite
        };
    }
}
