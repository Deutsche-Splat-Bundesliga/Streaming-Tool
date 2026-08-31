using System.Net;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Enums;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Middleware;

/// <summary>
/// Middleware that guards all <c>/api</c> endpoints.
/// </summary>
/// <remarks>
/// Behaviour:
/// <list type="bullet">
/// <item>Requests from the Control Panel (identified by their CORS origin) always pass.</item>
/// <item>If "allow unauthenticated requests" is enabled (default), every request passes.</item>
/// <item>Otherwise a valid API key must be sent via the <c>X-Api-Key</c> header.</item>
/// <item>Read-only keys may only perform GET requests (403 otherwise).</item>
/// <item>API management endpoints (<c>/api/api-*</c>) are reserved for the Control Panel while
/// authentication is enforced - API keys cannot manage other API keys.</item>
/// </list>
/// Every handled request is recorded in the in-memory <see cref="ApiRequestLog"/> and pushed
/// to Control Panel clients via SignalR so the API log updates live.
/// </remarks>
/// <param name="next">The next middleware in the pipeline.</param>
/// <param name="requestLog">The in-memory session log of API requests.</param>
/// <param name="hub">SignalR hub context used to push log entries to the Control Panel.</param>
/// <param name="log">The logging service.</param>
public class ApiAuthenticationMiddleware(
    RequestDelegate next,
    ApiRequestLog requestLog,
    IHubContext<OverlayHub, IOverlayClient> hub,
    ILogService log)
{
    /// <summary>
    /// Name of the HTTP header third-party clients use to send their API key.
    /// </summary>
    public const string ApiKeyHeaderName = "X-Api-Key";

    /// <summary>
    /// Source label used for requests issued by the Control Panel.
    /// </summary>
    public const string ControlPanelSource = "Control Panel";

    /// <summary>
    /// Source label used for requests without any (valid) API key.
    /// </summary>
    public const string AnonymousSource = "Anonym";

    /// <summary>
    /// Origins that identify the Control Panel. Requests carrying one of these origins
    /// bypass API key authentication so the panel can never lock itself out.
    /// Must match the CORS policy in Program.cs.
    /// </summary>
    private static readonly string[] ControlPanelOrigins =
    [
        "http://localhost:4200",
        "http://localhost:4201"
    ];

    /// <summary>
    /// Handles an incoming request: applies the authentication rules for API endpoints
    /// and records the request in the session log.
    /// </summary>
    /// <param name="context">The current HTTP context.</param>
    /// <param name="settingsService">Scoped service used to read the API settings.</param>
    /// <param name="keyService">Scoped service used to validate API keys.</param>
    public async Task InvokeAsync(
        HttpContext context,
        ApiSettingsService settingsService,
        ApiKeyService keyService)
    {
        // Only guard REST API endpoints; SignalR hubs, Swagger etc. are unaffected.
        // OPTIONS is skipped so CORS preflight requests always succeed.
        if (!context.Request.Path.StartsWithSegments("/api") || HttpMethods.IsOptions(context.Request.Method))
        {
            await next(context);
            return;
        }

        using IDisposable scope = log.BeginScope(nameof(ApiAuthenticationMiddleware));

        string source = AnonymousSource;
        bool rejected = false;
        HttpStatusCode rejectionStatusCode = HttpStatusCode.Unauthorized;
        string rejectionReason = string.Empty;

        string origin = context.Request.Headers.Origin.ToString();
        bool isControlPanel = ControlPanelOrigins.Contains(origin);

        if (isControlPanel)
        {
            source = ControlPanelSource;
        }
        else
        {
            string providedKey = context.Request.Headers[ApiKeyHeaderName].ToString();

            ApiKeyEntity? apiKey = string.IsNullOrEmpty(providedKey)
                ? null
                : await keyService.ValidateKeyAsync(providedKey);

            ApiSettingsDto settings = await settingsService.GetSettingsAsync();

            if (apiKey is not null)
            {
                source = apiKey.Name;

                if (apiKey.AccessLevel == ApiKeyAccessLevel.ReadOnly
                    && !HttpMethods.IsGet(context.Request.Method)
                    && !HttpMethods.IsHead(context.Request.Method))
                {
                    rejected = true;
                    rejectionStatusCode = HttpStatusCode.Forbidden;
                    rejectionReason = "This API key is read-only and cannot perform write requests.";
                }
                else if (!settings.AllowUnauthenticatedRequests && IsManagementPath(context.Request.Path))
                {
                    rejected = true;
                    rejectionStatusCode = HttpStatusCode.Forbidden;
                    rejectionReason = "API management endpoints are reserved for the Control Panel.";
                }
            }
            else if (!settings.AllowUnauthenticatedRequests)
            {
                rejected = true;
                rejectionStatusCode = HttpStatusCode.Unauthorized;
                rejectionReason = string.IsNullOrEmpty(providedKey)
                    ? $"Authentication is enabled. Provide an API key via the '{ApiKeyHeaderName}' header."
                    : "The provided API key is unknown.";
            }
        }

        if (rejected)
        {
            _ = log.WarningAsync("API request rejected", new
            {
                context.Request.Method,
                Path = context.Request.Path.ToString(),
                source,
                rejectionStatusCode,
                rejectionReason
            });

            context.Response.StatusCode = (int)rejectionStatusCode;
            await context.Response.WriteAsJsonAsync(new { error = rejectionReason });
        }
        else
        {
            try
            {
                await next(context);
            }
            catch (Exception)
            {
                await RecordAsync(context, source, rejected: false, statusCodeOverride: HttpStatusCode.InternalServerError);
                throw;
            }
        }

        await RecordAsync(context, source, rejected, statusCodeOverride: null);
    }

    /// <summary>
    /// Checks whether the given path belongs to the API management endpoints
    /// (settings, key management, log).
    /// </summary>
    /// <param name="path">The request path.</param>
    /// <returns>True if the path is an API management endpoint, otherwise false.</returns>
    private static bool IsManagementPath(PathString path)
    {
        return path.StartsWithSegments("/api/api-settings")
            || path.StartsWithSegments("/api/api-keys")
            || path.StartsWithSegments("/api/api-log");
    }

    /// <summary>
    /// Records the handled request in the session log and pushes the entry
    /// to Control Panel clients via SignalR.
    /// </summary>
    /// <param name="context">The current HTTP context.</param>
    /// <param name="source">Who issued the request.</param>
    /// <param name="rejected">Whether the request was rejected by this middleware.</param>
    /// <param name="statusCodeOverride">Optional status code overriding the response's one (used for exceptions).</param>
    private async Task RecordAsync(HttpContext context, string source, bool rejected, HttpStatusCode? statusCodeOverride)
    {
        ApiLogEntryDto entry = new()
        {
            Timestamp = DateTime.Now,
            Method = context.Request.Method,
            Path = context.Request.Path.ToString(),
            StatusCode = statusCodeOverride ?? (HttpStatusCode)context.Response.StatusCode,
            Source = source,
            WasRejected = rejected
        };

        requestLog.Add(entry);

        try
        {
            await hub.Clients.All.ApiLogEntryAdded(entry);
        }
        catch (Exception ex)
        {
            // A failed live-log push must never fail the actual API request.
            _ = log.WarningAsync("Failed to push API log entry via SignalR", ex);
        }
    }
}
