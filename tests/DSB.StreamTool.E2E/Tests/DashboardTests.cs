using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;

namespace DSB.StreamTool.E2E.Tests;

// Intentionally not [Parallelizable]: this fixture shares the backend's single global
// broadcast-state row with the other E2E fixtures (Sidebar/Dialog/Overlay). Running fixtures
// concurrently means one fixture's state writes get SignalR-broadcast to every open page and can
// mutate or detach DOM elements another fixture is mid-interaction with - especially under
// WebKit's slower rendering. See #103.
[TestFixture]
public class DashboardTests : PageTest
{
    private const string BaseUrl = "http://localhost:4200";

    [Test]
    public async Task Dashboard_Loads_ShowsTopbar()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".topbar")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .tournament-name-input")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .tournament-info-section")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .team-alpha-name-input")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .team-bravo-name-input")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .score")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_Loads_TopbarLeagueFormat()
    {
        await Page.GotoAsync(BaseUrl);
        await TourneySettingsDialog_ClickTourneyFormatButton(Page, "league-format-button");

        await Expect(Page.Locator(".topbar .season-input")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .week-input")).ToBeVisibleAsync();

        await Expect(Page.Locator(".topbar .division-select")).ToBeVisibleAsync();
        var options = Page.Locator(".topbar .division-select option");
        var count = await options.CountAsync();
        Assert.That(count, Is.GreaterThan(0), "Division select should have at least one option.");
    }

    [Test]
    public async Task Dashboard_Loads_TopbarStandardFormat()
    {
        await Page.GotoAsync(BaseUrl);
        await TourneySettingsDialog_ClickTourneyFormatButton(Page, "standard-format-button");

        await Expect(Page.Locator(".topbar .bracket-name-input")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_Topbar_Teams_BothInputsAreVisible()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".topbar .team-alpha-name-input")).ToBeVisibleAsync();
        await Expect(Page.Locator(".topbar .team-bravo-name-input")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_Topbar_Teams_InputsRespectMaxLength()
    {
        await Page.GotoAsync(BaseUrl);

        var alphaInput = Page.Locator(".topbar .team-alpha-name-input");
        var bravoInput = Page.Locator(".topbar .team-bravo-name-input");
        // maxLength is 30 characters
        await alphaInput.ClearAsync();
        await alphaInput.FillAsync("1WayTooLongTeamNameHereSeriously");

        await bravoInput.ClearAsync();
        await bravoInput.FillAsync("2WayTooLongTeamNameHereSeriously");

        var alphaValue = await alphaInput.InputValueAsync();
        var bravoValue = await bravoInput.InputValueAsync();
        Assert.That(alphaValue.Length, Is.LessThanOrEqualTo(30), "Team alpha name should be capped at 30 characters.");
        Assert.That(bravoValue.Length, Is.LessThanOrEqualTo(30), "Team bravo name should be capped at 30 characters.");
    }

    [Test]
    public async Task Dashboard_Loads_ShowsSidebar()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".sidebar")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_Loads_ShowsDashboardContainer()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".dashboard")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_Loads_ShowsAddMapButton()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".add-map-card")).ToBeVisibleAsync();
        await Expect(Page.Locator(".add-map-text")).ToContainTextAsync("Add Map");
    }

    [Test]
    public async Task Dashboard_AddMap_IncreasesMapCardCount()
    {
        await Page.GotoAsync(BaseUrl);
        var initialCount = await Page.Locator(".map-card").CountAsync();

        await Page.Locator(".add-map-card").ClickAsync();

        await Expect(Page.Locator(".map-card")).ToHaveCountAsync(initialCount + 1);
    }

    [Test]
    public async Task Dashboard_MapCard_ShowsTeamButtons()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".sidebar")).ToBeVisibleAsync();

        var count = await Page.Locator(".map-card").CountAsync();
        if (count == 0)
        {
            await Page.Locator(".add-map-card").ClickAsync();
            await Expect(Page.Locator(".map-card").First).ToBeVisibleAsync();
        }

        await Expect(Page.Locator(".map-card .controls button").First).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_MapCard_ShowsCounterpickButton()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".sidebar")).ToBeVisibleAsync();

        var count = await Page.Locator(".map-card").CountAsync();
        if (count == 0)
        {
            await Page.Locator(".add-map-card").ClickAsync();
            await Expect(Page.Locator(".map-card").First).ToBeVisibleAsync();
        }

        await Expect(Page.Locator(".map-card .settings__container button.counterpick-button").First).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_MapCard_ShowsEditButton()
    {
        await Page.GotoAsync(BaseUrl);

        var count = await Page.Locator(".map-card").CountAsync();
        if (count == 0)
            await Page.Locator(".add-map-card").ClickAsync();

        await Expect(Page.Locator(".map-card button.edit-button").First).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_MapCard_EditButton_OpensEditMenu()
    {
        await Page.GotoAsync(BaseUrl);

        var count = await Page.Locator(".map-card").CountAsync();
        if (count == 0)
            await Page.Locator(".add-map-card").ClickAsync();

        await Page.Locator(".map-card button.edit-button").First.ClickAsync();
        // The app-edit-card host has no CSS dimensions; check the inner div which has position:absolute + explicit size
        await Expect(Page.Locator("app-edit-card .edit-menu")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dashboard_MapCard_EditMenu_CanBeClosed()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".sidebar")).ToBeVisibleAsync();

        var count = await Page.Locator(".map-card").CountAsync();
        if (count == 0)
        {
            await Page.Locator(".add-map-card").ClickAsync();
            await Expect(Page.Locator(".map-card").First).ToBeVisibleAsync();
        }

        await Page.Locator(".map-card button.edit-button").First.ClickAsync();
        await Expect(Page.Locator("app-edit-card .edit-menu")).ToBeVisibleAsync();

        // Force the click because WebKit may report the div as unstable during Angular re-renders
        await Page.Locator("app-edit-card .close").ClickAsync(new() { Force = true });
        await Expect(Page.Locator("app-edit-card")).ToHaveCountAsync(0);
    }

    [Test]
    public async Task Dashboard_MapCard_MapSelect_IsVisible()
    {
        await Page.GotoAsync(BaseUrl);

        var count = await Page.Locator(".map-card").CountAsync();
        if (count == 0)
            await Page.Locator(".add-map-card").ClickAsync();

        await Expect(Page.Locator(".map-card .settings__container select").First).ToBeVisibleAsync();
    }

    /// <summary>
    /// Clicks the tournament format button to test topbar settings
    /// </summary>
    /// <param name="currentPage">Current page that the tester is running on</param>
    /// <param name="ButtonClass">Class of button to be clicked</param>
    public async Task TourneySettingsDialog_ClickTourneyFormatButton(IPage currentPage, string ButtonClass)
    {
        var dialogOpenButton = currentPage.Locator(".sidebar .open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        var formatButton = currentPage.Locator($".tourney-settings-dialog .{ButtonClass}");
        await Expect(formatButton).ToBeVisibleAsync();

        var formatButtonIsActive = await formatButton.EvaluateAsync<bool>("el => el.classList.contains('toggled')");
        if (!formatButtonIsActive)
        {
            await formatButton.ClickAsync();
            await Expect(formatButton).ToHaveClassAsync(new Regex(@"\btoggled\b"));
        }

        var closeButton = currentPage.Locator(".tourney-settings-dialog mat-dialog-actions .click-button");
        await Expect(closeButton).ToBeVisibleAsync();
        await closeButton.ClickAsync();
    }
}
