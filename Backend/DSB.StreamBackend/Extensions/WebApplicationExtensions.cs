using DSB.StreamBackend.Context;
using DSB.StreamBackend.Hubs;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Extensions;

/// <summary>
/// Extension methods that configure the backend's request pipeline and endpoints.
/// </summary>
public static class WebApplicationExtensions
{
    /// <summary>
    /// Applies any pending EF Core migrations on startup, creating the database if it doesn't exist.
    /// </summary>
    /// <param name="app">The application to migrate the database for.</param>
    /// <returns>The same <see cref="WebApplication"/> so calls can be chained.</returns>
    public static WebApplication MigrateDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<StreamToolDbContext>();

        db.Database.Migrate();

        return app;
    }

    /// <summary>
    /// Maps the SignalR hubs used by overlay and event clients.
    /// </summary>
    /// <param name="app">The application to map the hubs on.</param>
    /// <returns>The same <see cref="WebApplication"/> so calls can be chained.</returns>
    public static WebApplication MapStreamBackendHubs(this WebApplication app)
    {
        app.MapHub<OverlayHub>("/overlayHub");
        app.MapHub<EventHub>("/eventHub");

        return app;
    }
}
