using DSB.StreamBackend.Extensions;
using DSB.StreamBackend.Middleware;

// Program.cs wires up the web host: dependency injection, middleware, and endpoint routing.
// The actual configuration lives in the DSB.StreamBackend.Extensions classes.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStreamBackend(builder.Configuration);

var app = builder.Build();

app.UseCors(ServiceCollectionExtensions.FrontendCorsPolicyName);

// Guards /api endpoints (optional API key authentication) and records
// every API request in the in-memory session log.
app.UseMiddleware<ApiAuthenticationMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MigrateDatabase();

app.MapControllers();
app.MapStreamBackendHubs();

app.Run();
