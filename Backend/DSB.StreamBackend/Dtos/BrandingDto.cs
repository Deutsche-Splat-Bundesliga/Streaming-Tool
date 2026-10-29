using System.ComponentModel.DataAnnotations;

namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Organization branding shared by the control panel and broadcast overlays.
/// </summary>
public class BrandingDto
{
    [Required, StringLength(200)]
    public string OrganizationName { get; set; } = "Deutsche Splat Bundesliga";

    [Required, StringLength(40)]
    public string OrganizationShortName { get; set; } = "DSB";

    [Required, StringLength(200)]
    public string TournamentName { get; set; } = "Deutsche Splat Bundesliga";

    [Required, StringLength(2048)]
    public string LogoUrl { get; set; } = "assets/dsb/DSB_Logo.png";

    [Required, StringLength(2048)]
    public string LargeLogoUrl { get; set; } = "assets/dsb/DSB_Logo-Large.png";

    [Required, StringLength(2048)]
    public string OutlineLogoUrl { get; set; } = "assets/dsb/DSB_Outline_White.png";

    [Required, RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string PrimaryColor { get; set; } = "#501776";

    [Required, RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string SecondaryColor { get; set; } = "#c4c4c4";
}
