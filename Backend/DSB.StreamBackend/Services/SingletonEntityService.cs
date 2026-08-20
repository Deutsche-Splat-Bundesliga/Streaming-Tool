using DSB.StreamBackend.Context;
using DSB.StreamBackend.Logging;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Base class for services that manage a single, well-known ("singleton") database row of type
/// <typeparamref name="TEntity"/>, exposed to callers as <typeparamref name="TDto"/>.
/// </summary>
/// <remarks>
/// Centralizes the get-or-create-default, update, and logging boilerplate shared by all singleton
/// services (<see cref="BroadcastStateService"/>, <see cref="SocialsService"/>,
/// <see cref="CommentatorBoxTimeDataService"/>). A concrete service only has to describe how to reach
/// its <see cref="DbSet{TEntity}"/> and how to map between <typeparamref name="TEntity"/> and
/// <typeparamref name="TDto"/>.
/// </remarks>
/// <param name="db">The database context.</param>
/// <param name="log">The logging service.</param>
public abstract class SingletonEntityService<TEntity, TDto>(StreamToolDbContext db, ILogService log)
    where TEntity : class, new()
{
    /// <summary>
    /// The primary key value all singleton rows are stored under.
    /// </summary>
    protected const int SingletonId = 1;

    /// <summary>
    /// The database context, exposed so derived services don't need to capture their own copy.
    /// </summary>
    protected StreamToolDbContext Db => db;

    /// <summary>
    /// The logging service, exposed so derived services don't need to capture their own copy.
    /// </summary>
    protected ILogService Log => log;

    /// <summary>
    /// A short, lower-case, human-readable name of the entity, used in log messages (e.g. "socials").
    /// </summary>
    protected abstract string EntityName { get; }

    /// <summary>
    /// The <see cref="DbSet{TEntity}"/> backing this service.
    /// </summary>
    protected abstract DbSet<TEntity> DbSet { get; }

    /// <summary>
    /// Applies query includes (e.g. related collections) required before the entity can be used.
    /// Override to eager-load navigation properties.
    /// </summary>
    /// <param name="query">The base query to extend.</param>
    protected virtual IQueryable<TEntity> IncludeRelated(IQueryable<TEntity> query) => query;

    /// <summary>
    /// Copies the values of <paramref name="dto"/> onto <paramref name="entity"/>.
    /// </summary>
    protected abstract void Apply(TEntity entity, TDto dto);

    /// <summary>
    /// Converts <paramref name="entity"/> to its DTO representation.
    /// </summary>
    protected abstract TDto ToDto(TEntity entity);

    /// <summary>
    /// Builds the structured data attached to the "loaded"/"updated" log entries.
    /// Override to log entity-specific details.
    /// </summary>
    protected virtual object? GetLogData(TEntity entity) => null;

    /// <summary>
    /// Asynchronously loads the current state as a <typeparamref name="TDto"/>, creating the
    /// singleton row with default values first if it does not exist yet.
    /// </summary>
    /// <returns>A <see cref="Task"/> returning the state as <typeparamref name="TDto"/>.</returns>
    protected async Task<TDto> GetAsync()
    {
        using IDisposable scope = log.BeginScope($"Get{EntityName}");
        await log.DebugAsync($"Loading {EntityName}");

        try
        {
            TEntity entity = await GetOrCreateAsync();

            await log.InfoAsync($"{Capitalize(EntityName)} loaded", GetLogData(entity));

            return ToDto(entity);
        }
        catch (Exception ex)
        {
            await log.ErrorAsync($"Failed to load {EntityName}", ex);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously applies <paramref name="dto"/> to the singleton row and persists it, creating
    /// the row first if it does not exist yet.
    /// </summary>
    /// <param name="dto">The DTO containing the updated information.</param>
    /// <returns>The updated <typeparamref name="TDto"/>.</returns>
    protected async Task<TDto> UpdateAsync(TDto dto)
    {
        using IDisposable scope = log.BeginScope($"Update{EntityName}");
        await log.InfoAsync($"Updating {EntityName}", dto);

        try
        {
            TEntity entity = await GetOrCreateAsync();

            Apply(entity, dto);

            await db.SaveChangesAsync();

            await log.InfoAsync($"{Capitalize(EntityName)} updated", GetLogData(entity));

            return ToDto(entity);
        }
        catch (Exception ex)
        {
            await log.ErrorAsync($"Failed to update {EntityName}", ex, dto);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously gets or creates the singleton <typeparamref name="TEntity"/> row.
    /// </summary>
    private async Task<TEntity> GetOrCreateAsync()
    {
        await log.TraceAsync($"Loading {EntityName} entity");

        TEntity? entity = await IncludeRelated(DbSet)
            .FirstOrDefaultAsync(x => EF.Property<int>(x, "Id") == SingletonId);

        if (entity is not null)
        {
            await log.TraceAsync($"{Capitalize(EntityName)} entity exists");
            return entity;
        }

        await log.WarningAsync($"{Capitalize(EntityName)} not found, creating default");

        entity = new TEntity();

        DbSet.Add(entity);

        await db.SaveChangesAsync();

        await log.InfoAsync($"Created {EntityName}");

        return entity;
    }

    private static string Capitalize(string value) =>
        value.Length == 0 ? value : char.ToUpperInvariant(value[0]) + value[1..];
}
