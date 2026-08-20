using Microsoft.EntityFrameworkCore;
using DSB.StreamBackend.Context;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Middleware;
using DSB.StreamBackend.Services;
using DSB.StreamBackend.Logging;

// Program.cs configures the web host, dependency injection, middleware,
// SignalR, database migration, CORS, and endpoint routing for the backend.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSignalR();

builder.Services.AddDbContext<StreamToolDbContext>(options =>
{
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddSingleton<ILogService, LogService>();
builder.Services.AddSingleton<ILogSink, ConsoleLogSink>();
builder.Services.AddScoped<BroadcastStateService>();
builder.Services.AddScoped<SocialsService>();
builder.Services.AddScoped<CommentatorBoxTimeDataService>();
builder.Services.AddScoped<ApiSettingsService>();
builder.Services.AddScoped<ApiKeyService>();
builder.Services.AddSingleton<ApiRequestLog>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowFrontend");

// Guards /api endpoints (optional API key authentication) and records
// every API request in the in-memory session log.
app.UseMiddleware<ApiAuthenticationMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<StreamToolDbContext>();

    db.Database.Migrate();
}

app.MapControllers();

app.MapHub<OverlayHub>("/overlayHub");
app.MapHub<EventHub>("/eventHub");

app.Run();