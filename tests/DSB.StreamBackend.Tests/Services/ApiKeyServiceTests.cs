using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Enums;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class ApiKeyServiceTests
{
    private StreamToolDbContext _db = null!;
    private LogService _log = null!;
    private ILogSink[] _logSinks = null!;
    private ApiKeyService _service = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new StreamToolDbContext(options);
        _logSinks = [new ConsoleLogSink()];
        _log = new LogService(_logSinks);
        _service = new ApiKeyService(_db, _log);
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    [Test]
    public async Task CreateKeyAsync_ReturnsPlaintextKeyWithPrefix()
    {
        var result = await _service.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Stream Deck",
            AccessLevel = (int)ApiKeyAccessLevel.ReadWrite
        });

        Assert.That(result.Key, Does.StartWith(ApiKeyService.KeyPrefix));
        Assert.That(result.ApiKey.Name, Is.EqualTo("Stream Deck"));
        Assert.That(result.ApiKey.KeyPrefix, Is.EqualTo(result.Key[..12]));
    }

    [Test]
    public async Task CreateKeyAsync_DoesNotPersistPlaintextKey()
    {
        var result = await _service.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Secret Test",
            AccessLevel = (int)ApiKeyAccessLevel.ReadWrite
        });

        var entity = await _db.ApiKeys.FirstAsync();

        Assert.That(entity.KeyHash, Is.Not.EqualTo(result.Key));
        Assert.That(entity.KeyHash, Has.Length.EqualTo(64), "Key hash should be a SHA-256 hex string.");
    }

    [Test]
    public void CreateKeyAsync_WithEmptyName_Throws()
    {
        Assert.ThrowsAsync<ArgumentException>(() => _service.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "   ",
            AccessLevel = (int)ApiKeyAccessLevel.ReadWrite
        }));
    }

    [Test]
    public async Task GetKeysAsync_NeverExposesHashes()
    {
        await _service.CreateKeyAsync(new CreateApiKeyRequestDto { Name = "Key A" });

        var keys = await _service.GetKeysAsync();

        Assert.That(keys, Has.Count.EqualTo(1));
        Assert.That(keys[0].KeyPrefix, Has.Length.EqualTo(12));
    }

    [Test]
    public async Task ValidateKeyAsync_WithValidKey_ReturnsEntityAndSetsLastUsed()
    {
        var created = await _service.CreateKeyAsync(new CreateApiKeyRequestDto { Name = "Validate Me" });

        var entity = await _service.ValidateKeyAsync(created.Key);

        Assert.That(entity, Is.Not.Null);
        Assert.That(entity!.Name, Is.EqualTo("Validate Me"));
        Assert.That(entity.LastUsedAt, Is.Not.Null);
    }

    [Test]
    public async Task ValidateKeyAsync_WithUnknownKey_ReturnsNull()
    {
        var entity = await _service.ValidateKeyAsync("stt_definitelynotarealkey");

        Assert.That(entity, Is.Null);
    }

    [Test]
    public async Task DeleteKeyAsync_RemovesKey()
    {
        var created = await _service.CreateKeyAsync(new CreateApiKeyRequestDto { Name = "Delete Me" });

        var deleted = await _service.DeleteKeyAsync(created.ApiKey.Id);

        Assert.That(deleted, Is.True);
        Assert.That(await _db.ApiKeys.CountAsync(), Is.EqualTo(0));
    }

    [Test]
    public async Task DeleteKeyAsync_WithUnknownId_ReturnsFalse()
    {
        var deleted = await _service.DeleteKeyAsync("does-not-exist");

        Assert.That(deleted, Is.False);
    }

    [Test]
    public async Task ValidateKeyAsync_AfterDelete_ReturnsNull()
    {
        var created = await _service.CreateKeyAsync(new CreateApiKeyRequestDto { Name = "Revoked" });
        await _service.DeleteKeyAsync(created.ApiKey.Id);

        var entity = await _service.ValidateKeyAsync(created.Key);

        Assert.That(entity, Is.Null);
    }

    [Test]
    public async Task CreateKeyAsync_WithInvalidAccessLevel_FallsBackToReadWrite()
    {
        var created = await _service.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Weird Level",
            AccessLevel = 42
        });

        Assert.That(created.ApiKey.AccessLevel, Is.EqualTo((int)ApiKeyAccessLevel.ReadWrite));
    }
}
