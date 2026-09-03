using System.Drawing;
using Microsoft.Playwright.NUnit;

namespace DSB.StreamTool.E2E.Tests;

// Intentionally not [Parallelizable]: this fixture shares the backend's single global
// broadcast-state row with the other E2E fixtures (Dashboard/Sidebar/Overlay). Running fixtures
// concurrently means one fixture's state writes get SignalR-broadcast to every open page and can
// mutate or detach DOM elements another fixture is mid-interaction with - especially under
// WebKit's slower rendering. See #103.
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
        await Expect(Page.Locator(".sidebar .open-api-settings-dialog-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_TourneySettings_TourneyFormatButtons_Visible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".tourney-settings-dialog .tourney-format-buttons__container .standard-format-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".tourney-settings-dialog .tourney-format-buttons__container .league-format-button")).ToBeVisibleAsync();
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

        await Expect(Page.Locator(".color-settings-dialog .colors__container")).ToBeVisibleAsync();

        var colorContainers = Page.Locator(".color-settings-dialog .colors__container .color-display__container");
        var count = await colorContainers.CountAsync();
        Assert.That(count, Is.GreaterThanOrEqualTo(2), "Color options containers should have at least two container with colors.");
    }

    [Test]
    public async Task Dialog_ApiSettings_OpensAndShowsAuthToggle()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-api-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".api-settings-dialog")).ToBeVisibleAsync();
        await Expect(
            Page.Locator(".api-settings-dialog app-toggle-slider.toggle-slider-allow-unauthenticated")
        ).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_ApiSettings_CreateKeyForm_IsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-api-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".api-settings-dialog .api-key-name-input")).ToBeVisibleAsync();
        await Expect(Page.Locator(".api-settings-dialog .api-key-access-level-select")).ToBeVisibleAsync();
        await Expect(Page.Locator(".api-settings-dialog .create-api-key-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_ApiSettings_LogSection_IsVisible()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-api-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".api-settings-dialog .api-log-list")).ToBeAttachedAsync();
        await Expect(Page.Locator(".api-settings-dialog .clear-api-log-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_ApiSettings_CreateKey_RevealsPlaintextKeyOnce()
    {
        var dialogOpenButton = Page.Locator(".sidebar .open-api-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        var nameInput = Page.Locator(".api-settings-dialog .api-key-name-input");
        await nameInput.FillAsync("E2E Test Key");

        await Page.Locator(".api-settings-dialog .create-api-key-button").ClickAsync();

        // The plaintext key is revealed exactly once and starts with the "stt_" prefix.
        var createdKeyCode = Page.Locator(".api-settings-dialog .created-api-key__code");
        await Expect(createdKeyCode).ToBeVisibleAsync();
        await Expect(createdKeyCode).ToContainTextAsync("stt_");

        // The key also shows up in the issued-keys list.
        await Expect(
            Page.Locator(".api-settings-dialog .api-key-item__name", new() { HasTextString = "E2E Test Key" })
        ).ToBeVisibleAsync();

        // Clean up: revoke the key we just created so the test is repeatable.
        await Page.Locator(".api-settings-dialog .api-key-item", new() { HasTextString = "E2E Test Key" })
            .Locator(".revoke-api-key-button")
            .ClickAsync(new() { Force = true });

        await Expect(
            Page.Locator(".api-settings-dialog .api-key-item__name", new() { HasTextString = "E2E Test Key" })
        ).ToHaveCountAsync(0);
    }
}