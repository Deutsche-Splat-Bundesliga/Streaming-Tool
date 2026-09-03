using System.Text.RegularExpressions;
using Microsoft.Playwright.NUnit;

namespace DSB.StreamTool.E2E.Tests;

// Intentionally not [Parallelizable]: this fixture shares the backend's single global
// broadcast-state row with the other E2E fixtures (Dashboard/Dialog/Overlay). Running fixtures
// concurrently means one fixture's state writes get SignalR-broadcast to every open page and can
// mutate or detach DOM elements another fixture is mid-interaction with - especially under
// WebKit's slower rendering. See #103.
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
}
