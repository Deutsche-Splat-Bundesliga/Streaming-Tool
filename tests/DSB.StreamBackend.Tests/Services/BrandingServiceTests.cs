using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class BrandingServiceTests
{
    private StreamToolDbContext _db = null!;
    private BrandingService _service = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new StreamToolDbContext(options);
        _service = new BrandingService(_db, new LogService([new ConsoleLogSink()]));
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    [Test]
    public async Task GetBrandingAsync_WhenMissing_CreatesDefaultProfile()
    {
        var result = await _service.GetBrandingAsync();

        Assert.That(result.OrganizationName, Is.EqualTo("Deutsche Splat Bundesliga"));
        Assert.That(result.OrganizationShortName, Is.EqualTo("DSB"));
        Assert.That(result.LogoUrl, Is.EqualTo("assets/dsb/DSB_Logo.png"));
    }

    [Test]
    public async Task UpdateBrandingAsync_PersistsAllBrandingFields()
    {
        var dto = new BrandingDto
        {
            OrganizationName = "Example Organization",
            OrganizationShortName = "EX",
            TournamentName = "Example Cup",
            LogoUrl = "assets/example/logo.png",
            LargeLogoUrl = "assets/example/logo-large.png",
            OutlineLogoUrl = "assets/example/logo-outline.png",
            PrimaryColor = "#123456",
            SecondaryColor = "#abcdef"
        };

        var result = await _service.UpdateBrandingAsync(dto);
        var stored = await _db.Branding.SingleAsync(x => x.Id == 1);

        Assert.That(result.OrganizationName, Is.EqualTo(dto.OrganizationName));
        Assert.That(result.OrganizationShortName, Is.EqualTo(dto.OrganizationShortName));
        Assert.That(stored.OrganizationName, Is.EqualTo(dto.OrganizationName));
        Assert.That(stored.OrganizationShortName, Is.EqualTo(dto.OrganizationShortName));
        Assert.That(stored.TournamentName, Is.EqualTo(dto.TournamentName));
        Assert.That(stored.LogoUrl, Is.EqualTo(dto.LogoUrl));
        Assert.That(stored.LargeLogoUrl, Is.EqualTo(dto.LargeLogoUrl));
        Assert.That(stored.OutlineLogoUrl, Is.EqualTo(dto.OutlineLogoUrl));
        Assert.That(stored.PrimaryColor, Is.EqualTo(dto.PrimaryColor));
        Assert.That(stored.SecondaryColor, Is.EqualTo(dto.SecondaryColor));
    }

    [Test]
    public async Task BrandingAssetsService_StoresAndFindsSupportedImage()
    {
        var assetsService = new BrandingAssetsService(new LogService([new ConsoleLogSink()]));
        await using var stream = new MemoryStream(
            [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
        var image = new FormFile(stream, 0, stream.Length, "image", "logo.png");
        BrandingAssetFile? saved = null;

        try
        {
            saved = await assetsService.SaveAsync(image);

            Assert.That(File.Exists(saved.FullPath), Is.True);
            Assert.That(saved.ContentType, Is.EqualTo("image/png"));
            Assert.That(assetsService.Find(saved.FileName)?.FullPath, Is.EqualTo(saved.FullPath));
        }
        finally
        {
            if (saved is not null && File.Exists(saved.FullPath))
            {
                File.Delete(saved.FullPath);
            }
        }
    }
}
