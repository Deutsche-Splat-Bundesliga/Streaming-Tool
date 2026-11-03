namespace DSB.StreamBackend.Models;

/// <summary>
/// Stores the organization-specific branding used by the control panel and overlays.
/// </summary>
public class BrandingEntity
{
    public int Id { get; set; } = 1;

    public string OrganizationName { get; set; } = "Deutsche Splat Bundesliga";

    public string OrganizationShortName { get; set; } = "DSB";

    public string TournamentName { get; set; } = "Deutsche Splat Bundesliga";

    public string LogoUrl { get; set; } = "assets/dsb/DSB_Logo.png";

    public string LargeLogoUrl { get; set; } = "assets/dsb/DSB_Logo-Large.png";

    public string OutlineLogoUrl { get; set; } = "assets/dsb/DSB_Outline_White.png";

    public string PrimaryColor { get; set; } = "#501776";

    public string SecondaryColor { get; set; } = "#c4c4c4";
}
