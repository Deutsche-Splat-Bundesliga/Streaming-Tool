namespace DSB.StreamBackend.Models;

/// <summary>
/// Represents the current Social Media links
/// </summary>
public class SocialsEntity
{
    /// <summary>
    /// Gets or sets the single identifier for the socials
    /// </summary>
    public int Id { get; set; } = 1;

    /// <summary>
    /// Gets or sets the X (formerly Twitter) handle of the organisation
    /// </summary>
    public string XHandle { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Discord invite code of the organisation
    /// </summary>
    public string DiscordInvite { get; set; } = string.Empty;
}
