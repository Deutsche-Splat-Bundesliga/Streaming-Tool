using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using DSB.StreamBackend.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class ApiSettingsServiceTests
{
    private StreamToolDbContext _db = null!;
    private LogService _log = null!;
    private ILogSink[] _logSinks = null!;
    private ApiSettingsService _service = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new StreamToolDbContext(options);
        _logSinks = [new ConsoleLogSink()];
        _log = new LogService(_logSinks);
        _service = new ApiSettingsService(_db, _log);
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    [Test]
    public async Task GetSettingsAsync_WhenNoSettingsExist_CreatesAndReturnsDefaultSettings()
    {
        var result = await _service.GetSettingsAsync();

        Assert.That(result, Is.Not.Null);
        Assert.That(result.AllowUnauthenticatedRequests, Is.True);
    }

    [Test]
    public async Task GetSettingsAsync_WhenSettingsExist_ReturnsPersisted()
    {
        _db.ApiSettings.Add(new ApiSettingsEntity
        {
            Id = 1,
            AllowUnauthenticatedRequests = false
        });
        await _db.SaveChangesAsync();

        var result = await _service.GetSettingsAsync();

        Assert.That(result.AllowUnauthenticatedRequests, Is.False);
    }

    [Test]
    public async Task UpdateSettingsAsync_UpdatesAllFields()
    {
        var dto = new ApiSettingsDto
        {
            AllowUnauthenticatedRequests = false
        };

        var result = await _service.UpdateSettingsAsync(dto);

        Assert.That(result.AllowUnauthenticatedRequests, Is.False);
    }

    [Test]
    public async Task UpdateSettingsAsync_PersistsChangesToDatabase()
    {
        var dto = new ApiSettingsDto
        {
            AllowUnauthenticatedRequests = false
        };

        await _service.UpdateSettingsAsync(dto);

        var entity = await _db.ApiSettings.FirstAsync(x => x.Id == 1);
        Assert.That(entity.AllowUnauthenticatedRequests, Is.False);
    }
}
