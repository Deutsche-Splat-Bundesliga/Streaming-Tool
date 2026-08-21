using DSB.StreamBackend.Context;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Services;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Extensions;

/// <summary>
/// Extension methods that wire up the backend's dependency injection container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Name of the CORS policy that allows the Angular frontend to call the backend.
    /// </summary>
    public const string FrontendCorsPolicyName = "AllowFrontend";

    /// <summary>
    /// Registers controllers, SignalR, the database context, application services, CORS, and Swagger.
    /// </summary>
    /// <param name="services">The service collection to configure.</param>
    /// <param name="configuration">The application configuration, used to resolve the connection string.</param>
    /// <returns>The same <see cref="IServiceCollection"/> so calls can be chained.</returns>
    public static IServiceCollection AddStreamBackend(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        services.AddSignalR();

        services.AddDbContext<StreamToolDbContext>(options =>
        {
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddSingleton<ILogService, LogService>();
        services.AddSingleton<ILogSink, ConsoleLogSink>();
        services.AddScoped<BroadcastStateService>();
        services.AddScoped<SocialsService>();
        services.AddScoped<CommentatorBoxTimeDataService>();
        services.AddScoped<ApiSettingsService>();
        services.AddScoped<ApiKeyService>();
        services.AddSingleton<ApiRequestLog>();

        services.AddCors(options =>
        {
            options.AddPolicy(FrontendCorsPolicyName,
                policy =>
                {
                    policy
                        .WithOrigins(
                            "http://localhost:4200",
                            "http://localhost:4201")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        return services;
    }
}
