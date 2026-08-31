using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class BroadcastStateServiceTests
{
    private StreamToolDbContext _db = null!;
    private LogService _log = null!;
    private ILogSink[] _logSinks = null!;
    private BroadcastStateService _service = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new StreamToolDbContext(options);
        _logSinks = [new ConsoleLogSink()];
        _log = new LogService(_logSinks);
        _service = new BroadcastStateService(_db, _log);
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    [Test]
    public async Task GetStateAsync_WhenNoStateExists_CreatesAndReturnsDefaultState()
    {
        var result = await _service.GetStateAsync();

        Assert.That(result, Is.Not.Null);
        Assert.That(result.TeamAlphaName, Is.EqualTo("Team Alpha"));
        Assert.That(result.TeamBravoName, Is.EqualTo("Team Bravo"));
        Assert.That(result.AlphaIsLeft, Is.True);
    }

    [Test]
    public async Task GetStateAsync_WhenStateExists_ReturnsPersisted()
    {
        _db.BroadcastStates.Add(new BroadcastStateEntity
        {
            Id = 1,
            TeamAlphaName = "Alpha Squad",
            TeamBravoName = "Bravo Force",
            ScoreAlpha = 2,
            ScoreBravo = 1
        });
        await _db.SaveChangesAsync();

        var result = await _service.GetStateAsync();

        Assert.That(result.TeamAlphaName, Is.EqualTo("Alpha Squad"));
        Assert.That(result.TeamBravoName, Is.EqualTo("Bravo Force"));
        Assert.That(result.ScoreAlpha, Is.EqualTo(2));
        Assert.That(result.ScoreBravo, Is.EqualTo(1));
    }

    [Test]
    public async Task UpdateStateAsync_UpdatesAllFields()
    {
        var dto = new BroadcastStateDto
        {
            TeamAlphaName = "Team X",
            TeamBravoName = "Team Y",
            AlphaIsLeft = false,
            ScoreAlpha = 3,
            ScoreBravo = 2,
            Streamer = "StreamerPro",
            Commentator1 = "Caster A",
            Commentator2 = "Caster B",
            ShowMapScreen = false,
            ShowScoreBox = false,
            ShowCommentatorBox = false,
            ShowInfobox = false,
            Season = 11,
            Division = 3,
            Maps = [],
            Week = 1,
            StartTime = new DateTime(2026, 8, 16),
            CurrentColorsId = 7,
            ColorLockActive = true
        };

        var result = await _service.UpdateStateAsync(dto);

        Assert.That(result.TeamAlphaName, Is.EqualTo("Team X"));
        Assert.That(result.TeamBravoName, Is.EqualTo("Team Y"));
        Assert.That(result.AlphaIsLeft, Is.False);
        Assert.That(result.ScoreAlpha, Is.EqualTo(3));
        Assert.That(result.ScoreBravo, Is.EqualTo(2));
        Assert.That(result.Streamer, Is.EqualTo("StreamerPro"));
        Assert.That(result.Commentator1, Is.EqualTo("Caster A"));
        Assert.That(result.Commentator2, Is.EqualTo("Caster B"));
        Assert.That(result.ShowMapScreen, Is.False);
        Assert.That(result.ShowScoreBox, Is.False);
        Assert.That(result.ShowCommentatorBox, Is.False);
        Assert.That(result.ShowInfobox, Is.False);
        Assert.That(result.Season, Is.EqualTo(11));
        Assert.That(result.Division, Is.EqualTo(3));
        Assert.That(result.StartTime, Is.EqualTo(new DateTime(2026, 8, 16)));
        Assert.That(result.CurrentColorsId, Is.EqualTo(7));
        Assert.That(result.ColorLockActive, Is.True);
    }

    [Test]
    public async Task UpdateStateAsync_PersistsChangesToDatabase()
    {
        var dto = new BroadcastStateDto
        {
            TeamAlphaName = "Persisted Team",
            Maps = []
        };

        await _service.UpdateStateAsync(dto);

        var entity = await _db.BroadcastStates.FirstAsync(x => x.Id == 1);
        Assert.That(entity.TeamAlphaName, Is.EqualTo("Persisted Team"));
    }

    [Test]
    public async Task UpdateStateAsync_AddsNewMaps()
    {
        var dto = new BroadcastStateDto
        {
            Maps =
            [
                new MapStateDto { Id="", MapId = "scorch-gorge", Order = 0, ModeId = "sz" },
                new MapStateDto { Id="", MapId = "eeltail-alley", Order = 1, ModeId = "tc" }
            ]
        };

        var result = await _service.UpdateStateAsync(dto);

        Assert.That(result.Maps, Has.Count.EqualTo(2));
        Assert.That(result.Maps[0].MapId, Is.EqualTo("scorch-gorge"));
        Assert.That(result.Maps[0].ModeId, Is.EqualTo("sz"));
        Assert.That(result.Maps[1].MapId, Is.EqualTo("eeltail-alley"));
        Assert.That(result.Maps[1].ModeId, Is.EqualTo("tc"));
    }

    [Test]
    public async Task UpdateStateAsync_UpdatesExistingMap()
    {
        var existingId = Guid.NewGuid().ToString();
        _db.BroadcastStates.Add(new BroadcastStateEntity
        {
            Id = 1,
            Maps =
            [
                new MapStateEntity { Id = existingId, Order = 0, MapId = "scorch-gorge", ModeId = "sz", BroadcastStateEntityId = 1 }
            ]
        });
        await _db.SaveChangesAsync();

        var dto = new BroadcastStateDto
        {
            Maps =
            [
                new MapStateDto { Id = existingId, Order = 0, MapId = "inkblot-art-academy", ModeId = "tc" }
            ]
        };

        var result = await _service.UpdateStateAsync(dto);

        Assert.That(result.Maps, Has.Count.EqualTo(1));
        Assert.That(result.Maps[0].Id, Is.EqualTo(existingId));
        Assert.That(result.Maps[0].ModeId, Is.EqualTo("inkblot-art-academy"));
        Assert.That(result.Maps[0].ModeId, Is.EqualTo("tc"));
    }

    [Test]
    public async Task UpdateStateAsync_RemovesMapsNotInDto()
    {
        var keepId = Guid.NewGuid().ToString();
        var removeId = Guid.NewGuid().ToString();

        _db.BroadcastStates.Add(new BroadcastStateEntity
        {
            Id = 1,
            Maps =
            [
                new MapStateEntity { Id = keepId, Order = 0, MapId = "inkblot-art-academy", BroadcastStateEntityId = 1 },
                new MapStateEntity { Id = removeId, Order = 1, MapId = "scorch-gorge", BroadcastStateEntityId = 1 }
            ]
        });
        await _db.SaveChangesAsync();

        var dto = new BroadcastStateDto
        {
            Maps = [new MapStateDto { Id = keepId, Order = 0, MapId = "inkblot-art-academy" }]
        };

        var result = await _service.UpdateStateAsync(dto);

        Assert.That(result.Maps, Has.Count.EqualTo(1));
        Assert.That(result.Maps[0].Id, Is.EqualTo(keepId));
    }

    [Test]
    public async Task UpdateStateAsync_MapsOrderedByOrder()
    {
        var dto = new BroadcastStateDto
        {
            Maps =
            [
                new MapStateDto { Id = "", Order = 2, MapId = "Third" },
                new MapStateDto { Id = "", Order = 0, MapId = "First" },
                new MapStateDto { Id = "", Order = 1, MapId = "Second" }
            ]
        };

        var result = await _service.UpdateStateAsync(dto);

        Assert.That(result.Maps[0].MapId, Is.EqualTo("First"));
        Assert.That(result.Maps[1].MapId, Is.EqualTo("Second"));
        Assert.That(result.Maps[2].MapId, Is.EqualTo("Third"));
    }

    [Test]
    public async Task UpdateStateAsync_NewMapWithEmptyId_GetsGeneratedId()
    {
        var dto = new BroadcastStateDto
        {
            Maps = [new MapStateDto { Id = "", Order = 0, MapId = "New Map" }]
        };

        var result = await _service.UpdateStateAsync(dto);

        Assert.That(result.Maps[0].Id, Is.Not.Null.And.Not.Empty);
    }

    [Test]
    public async Task GetStateAsync_ReturnsMapsOrderedByOrder()
    {
        _db.BroadcastStates.Add(new BroadcastStateEntity
        {
            Id = 1,
            Maps =
            [
                new MapStateEntity { Id = Guid.NewGuid().ToString(), Order = 1, MapId = "Second", BroadcastStateEntityId = 1 },
                new MapStateEntity { Id = Guid.NewGuid().ToString(), Order = 0, MapId = "First", BroadcastStateEntityId = 1 }
            ]
        });
        await _db.SaveChangesAsync();

        var result = await _service.GetStateAsync();

        Assert.That(result.Maps[0].MapId, Is.EqualTo("First"));
        Assert.That(result.Maps[1].MapId, Is.EqualTo("Second"));
    }
}
