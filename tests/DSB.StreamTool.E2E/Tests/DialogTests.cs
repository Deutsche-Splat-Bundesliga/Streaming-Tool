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

    [TearDown]
    public async Task CloseDialog()
    {
        var closeDialogButton = Page.Locator("button[mat-dialog-close]");
        await Expect(closeDialogButton).ToBeVisibleAsync();
        await closeDialogButton.ClickAsync();

        await Expect(Page.Locator("mat-dialog-container")).Not.ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_OpenButtons_IsVisible()
    {
        await Expect(Page.Locator(".open-tourney-settings-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".open-streamer-comms-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".open-comm-box-settings-dialog-button")).ToBeVisibleAsync();
        await Expect(Page.Locator(".open-socials-dialog-button")).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_TourneySettings_Division_SelectIsVisible()
    {
        var dialogOpenButton = Page.Locator(".open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        await Expect(Page.Locator(".tourney-settings-dialog")).ToBeVisibleAsync();

        var divisionSelect = Page.Locator(".tourney-settings-dialog section:has(h2:text('Division')) select");
        await Expect(divisionSelect).ToBeVisibleAsync();
    }

    [Test]
    public async Task Dialog_TourneySettings_Division_SelectHasOptions()
    {
        var dialogOpenButton = Page.Locator(".open-tourney-settings-dialog-button");
        await dialogOpenButton.ClickAsync();

        var options = Page.Locator(".sidebar section:has(h2:text('Division')) select option");
        var count = await options.CountAsync();
        Assert.That(count, Is.GreaterThan(0), "Division select should have at least one option.");
    }
}