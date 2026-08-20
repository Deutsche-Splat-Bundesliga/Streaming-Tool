using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Enums;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Middleware;
using DSB.StreamBackend.Models;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Middleware;

[TestFixture]
public class ApiAuthenticationMiddlewareTests
{
    private StreamToolDbContext _db = null!;
    private LogService _log = null!;
    private ApiSettingsService _settingsService = null!;
    private ApiKeyService _keyService = null!;
    private ApiRequestLog _requestLog = null!;
    private Mock<IHubContext<OverlayHub, IOverlayClient>> _hubContextMock = null!;
    private Mock<IHubClients<IOverlayClient>> _hubClientsMock = null!;
    private Mock<IOverlayClient> _overlayClientMock = null!;
    private bool _nextWasCalled;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new StreamToolDbContext(options);
        _log = new LogService([new ConsoleLogSink()]);
        _settingsService = new ApiSettingsService(_db, _log);
        _keyService = new ApiKeyService(_db, _log);
        _requestLog = new ApiRequestLog();

        _overlayClientMock = new Mock<IOverlayClient>();
        _hubClientsMock = new Mock<IHubClients<IOverlayClient>>();
        _hubClientsMock.Setup(x => x.All).Returns(_overlayClientMock.Object);
        _hubContextMock = new Mock<IHubContext<OverlayHub, IOverlayClient>>();
        _hubContextMock.Setup(x => x.Clients).Returns(_hubClientsMock.Object);

        _nextWasCalled = false;
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    private ApiAuthenticationMiddleware CreateMiddleware()
    {
        return new ApiAuthenticationMiddleware(
            _ =>
            {
                _nextWasCalled = true;
                return Task.CompletedTask;
            },
            _requestLog,
            _hubContextMock.Object,
            _log);
    }

    private static DefaultHttpContext CreateContext(string method, string path)
    {
        var context = new DefaultHttpContext();
        context.Request.Method = method;
        context.Request.Path = path;
        context.Response.Body = new MemoryStream();
        return context;
    }

    private async Task DisableUnauthenticatedRequestsAsync()
    {
        await _settingsService.UpdateSettingsAsync(new ApiSettingsDto
        {
            AllowUnauthenticatedRequests = false
        });
    }

    [Test]
    public async Task NonApiPath_PassesThroughWithoutLogging()
    {
        var context = CreateContext("GET", "/overlayHub");

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.True);
        Assert.That(_requestLog.GetEntries(), Is.Empty);
    }

    [Test]
    public async Task AnonymousRequest_WhenUnauthenticatedAllowed_Passes()
    {
        var context = CreateContext("GET", "/api/broadcast/state");

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.True);
        Assert.That(_requestLog.GetEntries()[0].Source, Is.EqualTo(ApiAuthenticationMiddleware.AnonymousSource));
    }

    [Test]
    public async Task AnonymousRequest_WhenAuthEnforced_IsRejectedWith401()
    {
        await DisableUnauthenticatedRequestsAsync();
        var context = CreateContext("GET", "/api/broadcast/state");

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.False);
        Assert.That(context.Response.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
        Assert.That(_requestLog.GetEntries()[0].WasRejected, Is.True);
    }

    [Test]
    public async Task ControlPanelOrigin_WhenAuthEnforced_Passes()
    {
        await DisableUnauthenticatedRequestsAsync();
        var context = CreateContext("POST", "/api/broadcast/state");
        context.Request.Headers.Origin = "http://localhost:4200";

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.True);
        Assert.That(_requestLog.GetEntries()[0].Source, Is.EqualTo(ApiAuthenticationMiddleware.ControlPanelSource));
    }

    [Test]
    public async Task ValidKey_WhenAuthEnforced_Passes()
    {
        await DisableUnauthenticatedRequestsAsync();
        var created = await _keyService.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Stream Deck",
            AccessLevel = (int)ApiKeyAccessLevel.ReadWrite
        });

        var context = CreateContext("POST", "/api/broadcast/state");
        context.Request.Headers[ApiAuthenticationMiddleware.ApiKeyHeaderName] = created.Key;

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.True);
        Assert.That(_requestLog.GetEntries()[0].Source, Is.EqualTo("Stream Deck"));
    }

    [Test]
    public async Task InvalidKey_WhenAuthEnforced_IsRejectedWith401()
    {
        await DisableUnauthenticatedRequestsAsync();
        var context = CreateContext("GET", "/api/broadcast/state");
        context.Request.Headers[ApiAuthenticationMiddleware.ApiKeyHeaderName] = "stt_wrongkey";

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.False);
        Assert.That(context.Response.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

    [Test]
    public async Task ReadOnlyKey_WithWriteRequest_IsRejectedWith403()
    {
        var created = await _keyService.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Read Only",
            AccessLevel = (int)ApiKeyAccessLevel.ReadOnly
        });

        var context = CreateContext("POST", "/api/broadcast/state");
        context.Request.Headers[ApiAuthenticationMiddleware.ApiKeyHeaderName] = created.Key;

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.False);
        Assert.That(context.Response.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
    }

    [Test]
    public async Task ReadOnlyKey_WithReadRequest_Passes()
    {
        var created = await _keyService.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Read Only",
            AccessLevel = (int)ApiKeyAccessLevel.ReadOnly
        });

        var context = CreateContext("GET", "/api/broadcast/state");
        context.Request.Headers[ApiAuthenticationMiddleware.ApiKeyHeaderName] = created.Key;

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.True);
    }

    [Test]
    public async Task ApiKey_OnManagementEndpoint_WhenAuthEnforced_IsRejectedWith403()
    {
        await DisableUnauthenticatedRequestsAsync();
        var created = await _keyService.CreateKeyAsync(new CreateApiKeyRequestDto
        {
            Name = "Sneaky",
            AccessLevel = (int)ApiKeyAccessLevel.ReadWrite
        });

        var context = CreateContext("POST", "/api/api-keys");
        context.Request.Headers[ApiAuthenticationMiddleware.ApiKeyHeaderName] = created.Key;

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.False);
        Assert.That(context.Response.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
    }

    [Test]
    public async Task OptionsRequest_IsNeverBlocked()
    {
        await DisableUnauthenticatedRequestsAsync();
        var context = CreateContext("OPTIONS", "/api/broadcast/state");

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        Assert.That(_nextWasCalled, Is.True);
    }

    [Test]
    public async Task HandledRequest_IsPushedToSignalrClients()
    {
        var context = CreateContext("GET", "/api/broadcast/state");

        await CreateMiddleware().InvokeAsync(context, _settingsService, _keyService);

        _overlayClientMock.Verify(
            x => x.ApiLogEntryAdded(It.IsAny<ApiLogEntryDto>()),
            Times.Once);
    }
}
