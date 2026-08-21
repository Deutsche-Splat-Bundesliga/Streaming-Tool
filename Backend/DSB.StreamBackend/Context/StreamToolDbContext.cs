using Microsoft.EntityFrameworkCore;
using DSB.StreamBackend.Models;
using DSB.StreamBackend.Enums;

namespace DSB.StreamBackend.Context;

/// <summary>
/// DbContext for the StreamTool application, managing the database interactions for broadcast and map states.
/// </summary>
/// <param name="options">The options for configuring the DbContext.</param>
public class StreamToolDbContext(
    DbContextOptions<StreamToolDbContext> options) : DbContext(options)
{
    /// <summary>
    /// DbSet representing the collection of BroadcastStateEntity records in the database.
    /// </summary>
    public DbSet<BroadcastStateEntity> BroadcastStates => Set<BroadcastStateEntity>();

    /// <summary>
    /// DbSet representing the collection of MapStateEntity records in the database.
    /// </summary>
    public DbSet<MapStateEntity> MapStates => Set<MapStateEntity>();

    /// <summary>
    /// DbSet representing the collection of Socials records in the database.
    /// </summary>
    public DbSet<SocialsEntity> Socials => Set<SocialsEntity>();

    /// <summary>
    /// DbSet representing the collection of CommentatorBoxTimeData records in the database.
    /// </summary>
    public DbSet<CommentatorBoxTimeDataEntity> CommentatorBoxTimeData => Set<CommentatorBoxTimeDataEntity>();

    /// <summary>
    /// DbSet representing the collection of ApiSettings records in the database.
    /// </summary>
    public DbSet<ApiSettingsEntity> ApiSettings => Set<ApiSettingsEntity>();

    /// <summary>
    /// DbSet representing the collection of ApiKey records in the database.
    /// </summary>
    public DbSet<ApiKeyEntity> ApiKeys => Set<ApiKeyEntity>();

    /// <summary>
    /// Configures the model by defining the relationships and seeding initial data for the BroadcastStateEntity and MapStateEntity tables.
    /// </summary>
    /// <param name="modelBuilder">The ModelBuilder instance used to configure the model.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BroadcastStateEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<MapStateEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<SocialsEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<CommentatorBoxTimeDataEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<ApiSettingsEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<ApiKeyEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<BroadcastStateEntity>()
            .HasMany(x => x.Maps)
            .WithOne(x => x.BroadcastState)
            .HasForeignKey(x => x.BroadcastStateEntityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SocialsEntity>()
            .HasData(new SocialsEntity
            {
                Id = 1,
                XHandle = string.Empty,
                DiscordInvite = string.Empty
            });

        modelBuilder.Entity<ApiSettingsEntity>()
            .HasData(new ApiSettingsEntity
            {
                Id = 1,
                AllowUnauthenticatedRequests = true
            });

        modelBuilder.Entity<CommentatorBoxTimeDataEntity>()
            .HasData(new CommentatorBoxTimeDataEntity
            {
                Id = 1,
                ShowDisplayIntervalInSeconds = 50,
                HideDisplayIntervalInSeconds = 5,
                DisplayMode = (int)CommBoxDisplayMode.Manual
            });

        modelBuilder.Entity<BroadcastStateEntity>()
            .HasData(new BroadcastStateEntity
            {
                Id = 1,
                TeamAlphaName = "Team Alpha",
                TeamBravoName = "Team Bravo",
                AlphaIsLeft = true,
                ScoreAlpha = 0,
                ScoreBravo = 0,
                ShowMapScreen = true,
                ShowScoreBox = true,
                ShowCommentatorBox = true,
                ShowInfobox = true,
                Division = 1,
                Season = 10
            });
    }
}