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
}