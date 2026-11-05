using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Hubs;

/// <summary>
/// A SignalR hub for event clients.
/// </summary>
/// <remarks>
/// This hub provides a communication channel for streaming event clients
/// to receive real-time updates from the backend.
/// </remarks>
public class EventHub : Hub<IEventClient>
{
    /// <summary>
    /// Notifies all clients of a commentator box hide event when it gets invoked from the client
    /// </summary>
    public async Task CommBoxHideButtonClicked()
    {
        await Clients.All.CommBoxHideButtonClicked();
    }

    /// <summary>
    /// Notifies all clients of a commentator box show event when it gets invoked from the client
    /// </summary>
    public async Task CommBoxShowButtonClicked()
    {
        await Clients.All.CommBoxShowButtonClicked();
    }

    /// <summary>
    /// Notifies all clients of a commentator box show temp event when it gets invoked from the client
    /// </summary>
    public async Task CommBoxShowTempButtonClicked()
    {
        await Clients.All.CommBoxShowTempButtonClicked();
    }
}
