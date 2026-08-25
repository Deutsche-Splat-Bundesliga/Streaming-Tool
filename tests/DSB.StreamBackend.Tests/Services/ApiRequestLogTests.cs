using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Services;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class ApiRequestLogTests
{
    private ApiRequestLog _requestLog = null!;

    [SetUp]
    public void SetUp() => _requestLog = new ApiRequestLog();

    [Test]
    public void Add_StoresEntry()
    {
        _requestLog.Add(new ApiLogEntryDto { Method = "GET", Path = "/api/broadcast/state" });

        var entries = _requestLog.GetEntries();

        Assert.That(entries, Has.Count.EqualTo(1));
        Assert.That(entries[0].Path, Is.EqualTo("/api/broadcast/state"));
    }

    [Test]
    public void Add_BeyondCapacity_DropsOldestEntries()
    {
        for (int i = 0; i < ApiRequestLog.MaxEntries + 10; i++)
        {
            _requestLog.Add(new ApiLogEntryDto { Path = $"/api/test/{i}" });
        }

        var entries = _requestLog.GetEntries();

        Assert.That(entries, Has.Count.EqualTo(ApiRequestLog.MaxEntries));
        Assert.That(entries[0].Path, Is.EqualTo("/api/test/10"), "Oldest entries should have been dropped.");
    }

    [Test]
    public void Clear_RemovesAllEntries()
    {
        _requestLog.Add(new ApiLogEntryDto { Path = "/api/test" });

        _requestLog.Clear();

        Assert.That(_requestLog.GetEntries(), Is.Empty);
    }

    [Test]
    public void GetEntries_ReturnsSnapshot()
    {
        _requestLog.Add(new ApiLogEntryDto { Path = "/api/one" });

        var snapshot = _requestLog.GetEntries();
        _requestLog.Add(new ApiLogEntryDto { Path = "/api/two" });

        Assert.That(snapshot, Has.Count.EqualTo(1));
        Assert.That(_requestLog.GetEntries(), Has.Count.EqualTo(2));
    }
}
