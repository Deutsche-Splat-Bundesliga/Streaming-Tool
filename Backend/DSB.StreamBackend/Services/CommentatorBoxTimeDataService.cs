using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Contains all business logic related to the commentator box time data
/// </summary>
/// <param name="db">The database context</param>
/// <param name="log">The logging service</param>
public class CommentatorBoxTimeDataService(StreamToolDbContext db, ILogService log)
    : SingletonEntityService<CommentatorBoxTimeDataEntity, CommentatorBoxTimeDataDto>(db, log)
{
    /// <inheritdoc />
    protected override string EntityName => "commentator box time data";

    /// <inheritdoc />
    protected override DbSet<CommentatorBoxTimeDataEntity> DbSet => Db.CommentatorBoxTimeData;

    /// <inheritdoc />
    protected override object? GetLogData(CommentatorBoxTimeDataEntity entity) => new
    {
        entity.ShowDisplayIntervalInSeconds,
        entity.HideDisplayIntervalInSeconds,
        entity.DisplayMode
    };

    /// <summary>
    /// Asynchronously gets the commentator box time data
    /// </summary>
    /// <returns>A <see cref="Task"/> object returning a <see cref="CommentatorBoxTimeDataDto"/></returns>
    public Task<CommentatorBoxTimeDataDto> GetCommentatorBoxTimeDataAsync() => GetAsync();

    /// <summary>
    /// Asynchronously updates the commentator box time data
    /// </summary>
    /// <param name="dto">The <see cref="CommentatorBoxTimeDataDto"/> containing the updated information</param>
    /// <returns>The updated <see cref="CommentatorBoxTimeDataDto"/> object</returns>
    public Task<CommentatorBoxTimeDataDto> UpdateCommentatorBoxTimeDataAsync(CommentatorBoxTimeDataDto dto) => UpdateAsync(dto);

    /// <inheritdoc />
    protected override void Apply(CommentatorBoxTimeDataEntity entity, CommentatorBoxTimeDataDto dto)
    {
        entity.HideDisplayIntervalInSeconds = dto.HideDisplayIntervalInSeconds;
        entity.ShowDisplayIntervalInSeconds = dto.ShowDisplayIntervalInSeconds;
        entity.DisplayMode = dto.DisplayMode;
    }

    /// <inheritdoc />
    protected override CommentatorBoxTimeDataDto ToDto(CommentatorBoxTimeDataEntity entity)
    {
        return new CommentatorBoxTimeDataDto
        {
            HideDisplayIntervalInSeconds = entity.HideDisplayIntervalInSeconds,
            ShowDisplayIntervalInSeconds = entity.ShowDisplayIntervalInSeconds,
            DisplayMode = entity.DisplayMode
        };
    }
}
