using DSB.StreamBackend.Context;
using DSB.StreamBackend.Controllers;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Controllers;

[TestFixture]
public class BrandingControllerTests
{
    private StreamToolDbContext _db = null!;
    private Mock<IOverlayClient> _overlayClient = null!;
    private BrandingController _controller = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new StreamToolDbContext(options);
        var log = new LogService([new ConsoleLogSink()]);
        var service = new BrandingService(_db, log);
        var assetsService = new BrandingAssetsService(log);

        _overlayClient = new Mock<IOverlayClient>();
        var clients = new Mock<IHubClients<IOverlayClient>>();
        clients.Setup(x => x.All).Returns(_overlayClient.Object);
        var hub = new Mock<IHubContext<OverlayHub, IOverlayClient>>();
        hub.Setup(x => x.Clients).Returns(clients.Object);

        _controller = new BrandingController(service, assetsService, hub.Object);
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    [Test]
    public async Task GetBranding_ReturnsCurrentProfile()
    {
        var response = await _controller.GetBranding();

        Assert.That(response.Result, Is.InstanceOf<OkObjectResult>());
        var ok = (OkObjectResult)response.Result!;
        Assert.That(ok.Value, Is.InstanceOf<BrandingDto>());
    }

    [Test]
    public async Task UpdateBranding_ReturnsAndBroadcastsUpdatedProfile()
    {
        var branding = new BrandingDto
        {
            OrganizationName = "Example",
            OrganizationShortName = "EX",
            TournamentName = "Example Cup",
            LogoUrl = "assets/example/logo.png",
            LargeLogoUrl = "assets/example/logo-large.png",
            OutlineLogoUrl = "assets/example/logo-outline.png",
            PrimaryColor = "#123456",
            SecondaryColor = "#abcdef"
        };

        var response = await _controller.UpdateBranding(branding);

        Assert.That(response.Result, Is.InstanceOf<OkObjectResult>());
        _overlayClient.Verify(
            client => client.BrandingUpdated(It.Is<BrandingDto>(result =>
                result.OrganizationName == branding.OrganizationName &&
                result.PrimaryColor == branding.PrimaryColor)),
            Times.Once);
    }

    [Test]
    public async Task UploadBrandingAsset_RejectsUnsupportedFiles()
    {
        await using var stream = new MemoryStream([1, 2, 3, 4]);
        var image = new FormFile(stream, 0, stream.Length, "image", "payload.exe");

        var result = await _controller.UploadBrandingAsset(image);

        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }
}
