using DSB.StreamBackend.Context;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace DSB.StreamBackend.Tests.Services;

[TestFixture]
public class BrandingMigrationTests
{
    [Test]
    public async Task DatabaseMigration_CreatesDefaultBrandingProfile()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<StreamToolDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var db = new StreamToolDbContext(options);
        await db.Database.MigrateAsync();

        var branding = await db.Branding.SingleAsync(x => x.Id == 1);
        Assert.That(branding.OrganizationName, Is.EqualTo("Deutsche Splat Bundesliga"));
        Assert.That(branding.PrimaryColor, Is.EqualTo("#501776"));
    }
}
