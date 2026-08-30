using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Contains all business logic related to the broadcast state
/// </summary>
/// <param name="db">The database context</param>
/// <param name="log">The logging service</param>
public class BroadcastStateService(StreamToolDbContext db, ILogService log)
    : SingletonEntityService<BroadcastStateEntity, BroadcastStateDto>(db, log)
{
    /// <inheritdoc />
    protected override string EntityName => "broadcast state";

    /// <inheritdoc />
    protected override DbSet<BroadcastStateEntity> DbSet => Db.BroadcastStates;

    /// <inheritdoc />
    protected override IQueryable<BroadcastStateEntity> IncludeRelated(IQueryable<BroadcastStateEntity> query)
        => query.Include(x => x.Maps);

    /// <inheritdoc />
    protected override object? GetLogData(BroadcastStateEntity entity) => new
    {
        entity.ScoreAlpha,
        entity.ScoreBravo,
        Maps = entity.Maps.Count
    };

    /// <summary>
    /// Asynchronously gets the <see cref="BroadcastStateDto"/>
    /// </summary>
    /// <returns>A <see cref="Task"/> returning the state as <see cref="BroadcastStateDto"/></returns>
    public Task<BroadcastStateDto> GetStateAsync() => GetAsync();

    /// <summary>
    /// Asynchronously updates the <see cref="BroadcastStateEntity"/>
    /// </summary>
    /// <param name="dto">The <see cref="BroadcastStateDto"/> containing the updated information</param>
    /// <returns>The updated <see cref="BroadcastStateDto"/></returns>
    public Task<BroadcastStateDto> UpdateStateAsync(BroadcastStateDto dto) => UpdateAsync(dto);

    /// <inheritdoc />
    protected override void Apply(BroadcastStateEntity entity, BroadcastStateDto dto)
    {
        entity.TeamAlphaName = dto.TeamAlphaName;
        entity.TeamBravoName = dto.TeamBravoName;
        entity.AlphaIsLeft = dto.AlphaIsLeft;

        entity.ScoreAlpha = dto.ScoreAlpha;
        entity.ScoreBravo = dto.ScoreBravo;

        entity.Streamer = dto.Streamer;

        entity.Commentator1 = dto.Commentator1;
        entity.Commentator2 = dto.Commentator2;

        entity.ShowMapScreen = dto.ShowMapScreen;
        entity.ShowScoreBox = dto.ShowScoreBox;
        entity.ShowCommentatorBox = dto.ShowCommentatorBox;
        entity.ShowInfobox = dto.ShowInfobox;

        entity.Season = dto.Season;
        entity.Division = dto.Division;
        entity.Week = dto.Week;

        entity.StartTime = dto.StartTime;

        entity.CurrentColorsId = dto.CurrentColorsId;
        entity.ColorLockActive = dto.ColorLockActive;

        UpdateMaps(entity, dto.Maps);
    }

    /// <summary>
    /// Updates the maps contained in the <see cref="BroadcastStateEntity"/>
    /// </summary>
    /// <param name="entity">The <see cref="BroadcastStateEntity"/> database context</param>
    /// <param name="dtoMaps">A <see cref="List{T}"/> of the <see cref="MapStateDto"/>s to update</param>
    private void UpdateMaps(BroadcastStateEntity entity, List<MapStateDto> dtoMaps)
    {
        _ = Log.DebugAsync("Updating map state collection", new
        {
            Existing = entity.Maps.Count,
            Incoming = dtoMaps.Count
        });

        var dtoIds = dtoMaps
            .Where(x => !string.IsNullOrEmpty(x.Id))
            .Select(x => x.Id)
            .ToHashSet();

        var removed = entity.Maps
            .Where(x => !dtoIds.Contains(x.Id))
            .ToList();

        if (removed.Count > 0)
        {
            _ = Log.InfoAsync("Removing maps", removed.Select(x => x.Id));
        }

        Db.MapStates.RemoveRange(removed);

        foreach (var mapDto in dtoMaps.OrderBy(x => x.Order))
        {
            var existing = !string.IsNullOrEmpty(mapDto.Id)
                ? entity.Maps.FirstOrDefault(x => x.Id == mapDto.Id)
                : null;

            if (existing != null)
            {
                _ = Log.TraceAsync("Updating map", new
                {
                    existing.Id
                });

                existing.Order = mapDto.Order;
                existing.MapId = mapDto.MapId;
                existing.ModeId = mapDto.ModeId;
                existing.Winner = mapDto.Winner;
                existing.IsVisible = mapDto.IsVisible;
            }
            else
            {
                var id = string.IsNullOrEmpty(mapDto.Id)
                    ? Guid.NewGuid().ToString()
                    : mapDto.Id;

                _ = Log.InfoAsync("Adding map", new
                {
                    id,
                });

                entity.Maps.Add(new MapStateEntity
                {
                    Id = id,
                    Order = mapDto.Order,
                    MapId = mapDto.MapId,
                    ModeId = mapDto.ModeId,
                    Winner = mapDto.Winner,
                    IsVisible = mapDto.IsVisible,
                    BroadcastStateEntityId = 1
                });
            }
        }
    }

    /// <inheritdoc />
    protected override BroadcastStateDto ToDto(BroadcastStateEntity entity)
    {
        return new BroadcastStateDto
        {
            TeamAlphaName = entity.TeamAlphaName,
            TeamBravoName = entity.TeamBravoName,
            AlphaIsLeft = entity.AlphaIsLeft,
            ScoreAlpha = entity.ScoreAlpha,
            ScoreBravo = entity.ScoreBravo,
            Streamer = entity.Streamer,
            Commentator1 = entity.Commentator1,
            Commentator2 = entity.Commentator2,
            ShowMapScreen = entity.ShowMapScreen,
            ShowScoreBox = entity.ShowScoreBox,
            ShowCommentatorBox = entity.ShowCommentatorBox,
            ShowInfobox = entity.ShowInfobox,
            Maps =
            [
                ..entity.Maps.OrderBy(x => x.Order)
                    .Select(x => new MapStateDto
                    {
                        Id = x.Id,
                        Order = x.Order,
                        MapId = x.MapId,
                        ModeId = x.ModeId,
                        Winner = x.Winner,
                        IsVisible = x.IsVisible
                    })
            ],
            Season = entity.Season,
            Division = entity.Division,
            Week = entity.Week,
            StartTime = entity.StartTime,
            CurrentColorsId = entity.CurrentColorsId,
            ColorLockActive = entity.ColorLockActive
        };
    }
}
