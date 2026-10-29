using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class LogServiceTests
{
    [Test]
    public async Task InfoAsync_RecordsCallSite()
    {
        RecordingLogSink sink = new();
        LogService service = new([sink]);

        await service.InfoAsync("location test");

        Assert.That(sink.Entry, Is.Not.Null);
        Assert.That(sink.Entry!.Source, Does.Match(@"^LogServiceTests\.cs:\d+$"));
    }

    private sealed class RecordingLogSink : ILogSink
    {
        public LogEntry? Entry { get; private set; }

        public Task WriteAsync(LogEntry entry)
        {
            Entry = entry;
            return Task.CompletedTask;
        }
    }
}
