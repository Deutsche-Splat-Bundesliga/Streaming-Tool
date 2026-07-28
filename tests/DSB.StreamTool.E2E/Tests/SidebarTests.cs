using System.Text.RegularExpressions;
using Microsoft.Playwright.NUnit;

namespace DSB.StreamTool.E2E.Tests;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class SidebarTests : PageTest
{
    private const string BaseUrl = "http://localhost:4200";

    [SetUp]
    public async Task NavigateToDashboard()
    {
        await Page.GotoAsync(BaseUrl);
        await Expect(Page.Locator(".sidebar")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Sidebar_Teams_BothInputsAreVisible()
    {
        var teamInputs = Page.Locator(".sidebar section:has(h2:text('Teams')) input");
        await Expect(teamInputs.First).ToBeVisibleAsync();
        await Expect(teamInputs.Nth(1)).ToBeVisibleAsync();
    }

    [Test]
    public async Task Sidebar_TeamAlphaName_UpdatesTopbar()
    {
        var alphaInput = Page.Locator(".sidebar section:has(h2:text('Teams')) input").First;
        await alphaInput.ClearAsync();
        await alphaInput.FillAsync("AlphaE2E");

        await Expect(Page.Locator(".topbar .score")).ToContainTextAsync("AlphaE2E");
    }

    [Test]
    public async Task Sidebar_TeamBravoName_UpdatesTopbar()
    {
        var bravoInput = Page.Locator(".sidebar section:has(h2:text('Teams')) input").Nth(1);
        await bravoInput.ClearAsync();
        await bravoInput.FillAsync("BravoE2E");

        await Expect(Page.Locator(".topbar .score")).ToContainTextAsync("BravoE2E");
    }

    [Test]
    public async Task Sidebar_TeamAlphaName_RespectsMaxLength()
    {
        var alphaInput = Page.Locator(".sidebar section:has(h2:text('Teams')) input").First;
        // maxLength is 30 characters
        await alphaInput.ClearAsync();
        await alphaInput.FillAsync("WayTooLongTeamNameHereSeriously");

        var value = await alphaInput.InputValueAsync();
        Assert.That(value.Length, Is.LessThanOrEqualTo(30), "Team name should be capped at 30 characters.");
    }

    [Test]
    public async Task Sidebar_AlphaIsLeft_ToggleSliderIsVisible()
    {
        var toggleSlider = Page.Locator(".sidebar .swap-sides app-toggle-slider.toggle-slider-alpha-left");
        await Expect(toggleSlider).ToBeVisibleAsync();
    }

    [Test]
    public async Task Sidebar_Visibility_AllThreeButtonsPresent()
    {
        await Expect(Page.Locator("app-toggle-slider.toggle-slider-show-map-screen")).ToBeVisibleAsync();
        await Expect(Page.Locator("app-toggle-slider.toggle-slider-show-score-box")).ToBeVisibleAsync();
        await Expect(Page.Locator("app-toggle-slider.toggle-slider-show-commentator-box")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Sidebar_Visibility_MapScreenButton_TogglesActiveClass()
    {
        var btn = Page.Locator("app-toggle-slider.toggle-slider-show-map-screen");
        var wasActive = await btn.EvaluateAsync<bool>("el => el.classList.contains('toggled')");

        await btn.ClickAsync();

        if (wasActive)
            await Expect(btn).Not.ToHaveClassAsync(new Regex(@"\btoggled\b"));
        else
            await Expect(btn).ToHaveClassAsync(new Regex(@"\btoggled\b"));
    }

    [Test]
    public async Task Sidebar_Visibility_ScoreBoxButton_TogglesActiveClass()
    {
        var btn = Page.Locator("app-toggle-slider.toggle-slider-show-score-box");
        var wasActive = await btn.EvaluateAsync<bool>("el => el.classList.contains('toggled')");

        await btn.ClickAsync();

        if (wasActive)
            await Expect(btn).Not.ToHaveClassAsync(new Regex(@"\btoggled\b"));
        else
            await Expect(btn).ToHaveClassAsync(new Regex(@"\btoggled\b"));
    }

    [Test]
    public async Task Sidebar_Visibility_CommentatorButton_TogglesActiveClass()
    {
        var btn = Page.Locator("app-toggle-slider.toggle-slider-show-commentator-box");
        var wasActive = await btn.EvaluateAsync<bool>("el => el.classList.contains('toggled')");

        await btn.ClickAsync();

        if (wasActive)
            await Expect(btn).Not.ToHaveClassAsync(new Regex(@"\btoggled\b"));
        else
            await Expect(btn).ToHaveClassAsync(new Regex(@"\btoggled\b"));
    }

    [Test]
    public async Task Sidebar_ColorSettings_SettingsButtonVisible()
    {
        await Expect(Page.Locator(".open-colors-settings-dialog-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Sidebar_ColorSettings_OpenAndCloseDialog()
    {
        var btn = Page.Locator(".open-colors-settings-dialog-button");
        await btn.ClickAsync();

        await Expect(Page.Locator(".color-settings-dialog")).ToBeVisibleAsync();

        var closeDialogBtn = Page.Locator(".color-settings-dialog button[mat-dialog-close]");
        await closeDialogBtn.ClickAsync();

        await Expect(Page.Locator(".color-settings-dialog")).Not.ToBeVisibleAsync();
    }
}
