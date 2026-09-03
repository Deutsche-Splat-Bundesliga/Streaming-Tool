using System.Text.RegularExpressions;
using Microsoft.Playwright.NUnit;

namespace DSB.StreamTool.E2E.Tests;

// Intentionally not [Parallelizable]: this fixture shares the backend's single global
// broadcast-state row with the other E2E fixtures (Dashboard/Sidebar/Dialog). Running fixtures
// concurrently means one fixture's state writes get SignalR-broadcast to every open page and can
// mutate or detach DOM elements another fixture is mid-interaction with - especially under
// WebKit's slower rendering. See #103.
[TestFixture]
public partial class OverlayTests : PageTest
{
    private const string BaseUrl = "http://localhost:4200";

    // --- Score Box ---

    [Test]
    public async Task ScoreBox_PageLoads()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/score-box");
        await Expect(Page.Locator(".score-box")).ToBeAttachedAsync();
    }

    [Test]
    public async Task ScoreBox_ShowsTeamNameElements()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/score-box");
        await Expect(Page.Locator(".score-box .team-left-name")).ToBeAttachedAsync();
        await Expect(Page.Locator(".score-box .team-right-name")).ToBeAttachedAsync();
    }

    [Test]
    public async Task ScoreBox_ShowsScoreElements()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/score-box");
        await Expect(Page.Locator(".score-box .team-left-score")).ToBeAttachedAsync();
        await Expect(Page.Locator(".score-box .team-right-score")).ToBeAttachedAsync();
    }

    // --- Commentator Box ---

    [Test]
    public async Task CommentatorBox_PageLoads()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/commentator-box");
        await Expect(Page.Locator(".commentator-box")).ToBeAttachedAsync();
    }

    [Test]
    public async Task CommentatorBox_ShowsStreamerElement()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/commentator-box");
        await Expect(Page.Locator(".commentator-box .streamer-icon")).ToBeAttachedAsync();
        await Expect(Page.Locator(".commentator-box .streamer-text")).ToBeAttachedAsync();
    }

    [Test]
    public async Task CommentatorBox_ShowsCastersElement()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/commentator-box");
        await Expect(Page.Locator(".commentator-box .commentators-icon")).ToBeAttachedAsync();
        await Expect(Page.Locator(".commentator-box .commentator1-text")).ToBeAttachedAsync();
        await Expect(Page.Locator(".commentator-box .commentator2-text")).ToBeAttachedAsync();
    }

    // --- Infobox ---

    [Test]
    public async Task Infobox_PageLoads()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/info-box");
        await Expect(Page.Locator(".infobox")).ToBeAttachedAsync();
    }

    [Test]
    public async Task Infobox_ShowsVersusContainer()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/info-box");
        await Expect(Page.Locator(".infobox .versus")).ToBeAttachedAsync();
    }

    [Test]
    public async Task Infobox_Versus_ContainsVsLabel()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/info-box");
        await Expect(Page.Locator(".infobox .versus")).ToContainTextAsync("VS");
    }

    [Test]
    public async Task Infobox_ShowsScoreElement()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/info-box");
        await Expect(Page.Locator(".infobox .score")).ToBeAttachedAsync();
    }

    // --- Map Screen ---

    [Test]
    public async Task MapScreen_PageLoads()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/map-screen");
        await Expect(Page.Locator(".map-screen")).ToBeAttachedAsync();
    }

    [Test]
    public async Task MapScreen_ShowsHeader()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/map-screen");
        await Expect(Page.Locator(".map-screen .header")).ToBeAttachedAsync();
    }

    [Test]
    public async Task MapScreen_Header_ShowsTeamNames()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/map-screen");
        await Expect(Page.Locator(".map-screen .team-left-name")).ToBeAttachedAsync();
        await Expect(Page.Locator(".map-screen .team-right-name")).ToBeAttachedAsync();
    }

    [Test]
    public async Task MapScreen_Header_ShowsMatchScore()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/map-screen");
        await Expect(Page.Locator(".map-screen .match-score")).ToBeAttachedAsync();
    }

    [Test]
    public async Task MapScreen_Header_ShowsSeasonDivisionText()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/map-screen");
        await Expect(Page.Locator(".map-screen .tourney-info")).ToBeAttachedAsync();
    }

    [Test]
    public async Task MapScreen_ShowsMapGrid()
    {
        await Page.GotoAsync($"{BaseUrl}/overlay/map-screen");
        await Expect(Page.Locator(".map-screen .map-grid")).ToBeAttachedAsync();
    }

    // --- Cross-Page: Visibility toggle ---

    [Test]
    public async Task ScoreBox_VisibilityToggle_TogglesOpacity()
    {
        // Navigate to dashboard and read current visibility state
        await Page.GotoAsync(BaseUrl);
        var btn = Page.Locator("app-toggle-slider.toggle-slider-show-score-box");
        var isCurrentlyActive = await btn.EvaluateAsync<bool>("el => el.classList.contains('toggled')");

        // Open the overlay in a second tab
        var overlayPage = await Page.Context.NewPageAsync();
        await overlayPage.GotoAsync($"{BaseUrl}/overlay/score-box");

        // Toggle visibility and wait for Angular to update the DOM
        await btn.ClickAsync();
        if (isCurrentlyActive)
            await Expect(btn).Not.ToHaveClassAsync(new Regex(@"\btoggled\b"));
        else
            await Expect(btn).ToHaveClassAsync(new Regex(@"\btoggled\b"));

        // Restore original state
        await btn.ClickAsync();
        if (isCurrentlyActive)
            await Expect(btn).ToHaveClassAsync(new Regex(@"\btoggled\b"));
        else
            await Expect(btn).Not.ToHaveClassAsync(new Regex(@"\btoggled\b"));

        await overlayPage.CloseAsync();
    }

    public async Task EndScreen_Socials_SocialsContentVisible()
    {
        await Page.GotoAsync(BaseUrl);

        var socialsDialogButton = Page.Locator(".sidebar .open-socials-dialog-button");
        await socialsDialogButton.ClickAsync();

        var twitterInput = Page.Locator(".socials-dialog .twitter-handle-input");
        var discordInput = Page.Locator(".socials-dialog .discord-invite-input");

        await twitterInput.FillAsync("@E2ETestDSB");
        await Expect(twitterInput).ToHaveValueAsync("@E2ETestDSB");

        await discordInput.FillAsync("e2eDiscordInv");
        await Expect(discordInput).ToHaveValueAsync("e2eDiscordInv");

        var endScreenPage = await Page.Context.NewPageAsync();
        await endScreenPage.GotoAsync($"{BaseUrl}/overlay/end-screen");

        await Expect(endScreenPage.Locator(".socials-text.twitter-link")).ToBeAttachedAsync();
        await Expect(endScreenPage.Locator(".socials-text.twitter-link")).ToContainTextAsync("@E2ETestDSB");

        await Expect(endScreenPage.Locator(".socials-text.discord-invite")).ToBeAttachedAsync();
        await Expect(endScreenPage.Locator(".socials-text.discord-invite")).ToContainTextAsync("discord.gg/e2eDiscordInv");

        await endScreenPage.CloseAsync();
    }

    [Test]
    public async Task EndScreen_Socials_SocialsInvisibleOnEmptyInput()
    {
        await Page.GotoAsync(BaseUrl);

        var socialsDialogButton = Page.Locator(".sidebar .open-socials-dialog-button");
        await socialsDialogButton.ClickAsync();

        var twitterInput = Page.Locator(".socials-dialog .twitter-handle-input");
        var discordInput = Page.Locator(".socials-dialog .discord-invite-input");

        await twitterInput.FillAsync(string.Empty);
        await Expect(twitterInput).ToHaveValueAsync(string.Empty);

        await discordInput.FillAsync(string.Empty);
        await Expect(discordInput).ToHaveValueAsync(string.Empty);

        var endScreenPage = await Page.Context.NewPageAsync();
        await endScreenPage.GotoAsync($"{BaseUrl}/overlay/end-screen");

        await Expect(endScreenPage.Locator(".socials-text.twitter-link")).Not.ToBeAttachedAsync();
        await Expect(endScreenPage.Locator(".socials-text.discord-invite")).Not.ToBeAttachedAsync();

        await endScreenPage.CloseAsync();
    }
}
