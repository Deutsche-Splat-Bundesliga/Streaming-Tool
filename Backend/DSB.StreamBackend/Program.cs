using DSB.StreamBackend.Extensions;

// Program.cs wires up the web host: dependency injection, middleware, and endpoint routing.
// The actual configuration lives in the DSB.StreamBackend.Extensions classes.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStreamBackend(builder.Configuration);

var app = builder.Build();

app.UseCors(ServiceCollectionExtensions.FrontendCorsPolicyName);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MigrateDatabase();

app.MapControllers();
app.MapStreamBackendHubs();

app.Run();
