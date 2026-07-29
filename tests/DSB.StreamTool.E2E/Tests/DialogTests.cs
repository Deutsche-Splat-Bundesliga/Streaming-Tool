using System.Drawing;
using Microsoft.Playwright.NUnit;

namespace DSB.StreamTool.E2E.Tests;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class DialogTests : PageTest
{
    private const string BaseUrl = "http://localhost:4200";

    [SetUp]
    public async Task NavigateToDashboard()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".sidebar")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_OpenButtons_IsVisible()
    {
        await Expect(Page.Locator(".sidebar .open-colors-settings-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".sidebar .open-tourney-settings-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".sidebar .open-streamer-comms-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".sidebar .open-comm-box-settings-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".sidebar .open-socials-dialog-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_TourneySettings_Division_SelectIsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".tourney-settings-dialog")).ToBeVisibleAsync();

        var divisionSelect = Page.Locator(".tourney-settings-dialog section:has(h2:text('Division')) select");
        await Expect(divisionSelect).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_TourneySettings_Division_SelectHasOptions()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        var options = Page.Locator(".tourney-settings-dialog section:has(h2:text('Division')) select option");
        var count = await options.CountAsync();
        Assert.That(count, Is.GreaterThan(0), "Division select should have at least one option.");
    }

    [Test]
    public async Task Dialog_TourneySettings_Week_IsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".tourney-settings-dialog .week-section input")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_TourneySettings_StartTime_IsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".tourney-settings-dialog .start-time-section input")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_StreamerCommsSettings_Streamer_InputAcceptsText()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-streamer-comms-dialog-button");
        await dialogOpenButton.ClickAsync();

        var streamerInput = Page.Locator(".streamer-comms-dialog input[placeholder='Streamer']");
        await streamerInput.ClearAsync();
        await streamerInput.FillAsync("TestStreamer");

        await Expect(streamerInput).ToHaveValueAsync("TestStreamer");
    }

    [Test]
    public async Task Dialog_StreamerCommsSettings_Commentator1_InputAcceptsText()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-streamer-comms-dialog-button");
        await dialogOpenButton.ClickAsync();

        var caster1 = Page.Locator(".streamer-comms-dialog input[placeholder='Caster1']");
        await caster1.ClearAsync();
        await caster1.FillAsync("CasterOne");

        await Expect(caster1).ToHaveValueAsync("CasterOne");
    }

    [Test]
    public async Task Dialog_StreamerCommsSettings_Commentator2_InputAcceptsText()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-streamer-comms-dialog-button");
        await dialogOpenButton.ClickAsync();

        var caster2 = Page.Locator(".streamer-comms-dialog input[placeholder='Caster2']");
        await caster2.ClearAsync();
        await caster2.FillAsync("CasterTwo");

        await Expect(caster2).ToHaveValueAsync("CasterTwo");
    }

    [Test]
    public async Task Dialog_CommBoxDisplaySettings_ModeButtons_AreVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-comm-box-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".comm-box-settings-dialog .manual-display-mode-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".comm-box-settings-dialog .auto-display-mode-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_CommBoxDisplaySettings_ShowCommBoxIntervalInput_IsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-comm-box-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".comm-box-settings-dialog .show-comm-box-interval-input")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_ColorSettings_ColorLockToggleSlider_IsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-colors-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".color-settings-dialog label app-toggle-slider")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_ColorSettings_Colors_HasOptions()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-colors-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        var colorContainers = Page.Locator(".color-settings-dialog .color-display__container");
        var count = await colorContainers.CountAsync();
        Assert.That(count, Is.GreaterThanOrEqualTo(2), "Color options containers should have at least two container with colors.");
    }
}