using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Hubs;

/// <summary>
/// A SignalR hub for overlay clients.
/// </summary>
/// <remarks>
/// This hub provides a communication channel for streaming overlay clients
/// to receive real-time updates from the backend.
/// </remarks>
public class OverlayHub : Hub<IOverlayClient> { }
