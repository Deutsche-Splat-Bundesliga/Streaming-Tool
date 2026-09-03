namespace DSB.StreamBackend.Dtos;

/// <summary>
/// Represents the broadcast state for the streaming tool.
/// </summary>
public class BroadcastStateDto
{
    /// <summary>
    /// Gets or sets the name of Team Alpha.
    /// </summary>
    public string TeamAlphaName { get; set; } = "Team Alpha";

    /// <summary>
    /// Gets or sets the name of Team Bravo.
    /// </summary>
    public string TeamBravoName { get; set; } = "Team Bravo";

    /// <summary>
    /// Gets or sets a value indicating whether Team Alpha is displayed on the left.
    /// </summary>
    public bool AlphaIsLeft { get; set; } = true;

    /// <summary>
    /// Gets or sets the score for Team Alpha.
    /// </summary>
    public int ScoreAlpha { get; set; }

    /// <summary>
    /// Gets or sets the score for Team Bravo.
    /// </summary>
    public int ScoreBravo { get; set; }

    /// <summary>
    /// Sets the name of the streamer
    /// </summary>
    public string Streamer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the first commentator name.
    public string Commentator1 { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the second commentator name.
    /// </summary>
    public string Commentator2 { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the map screen is shown.
    /// </summary>
    public bool ShowMapScreen { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the score box is shown.
    /// </summary>
    public bool ShowScoreBox { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the commentator box is shown.
    /// </summary>
    public bool ShowCommentatorBox { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the infobox is shown.
    /// </summary>
    public bool ShowInfobox { get; set; } = true;

    /// <summary>
    /// Gets or sets the collection of map states.
    /// </summary>
    public List<MapStateDto> Maps { get; set; } = [];

    /// <summary>
    /// Gets or sets the current season number.
    /// </summary>
    public int Season { get; set; }

    /// <summary>
    /// Gets or sets the current division number.
    /// </summary>
    public int Division { get; set; }

    /// <summary>
    /// Gets or sets the current week number.
    /// </summary>
    public int Week { get; set; }

    /// <summary>
    /// Gets or sets if the current tournament is a league format tournament or a normal bracket tournament
    /// </summary>
    public bool IsLeague { get; set; } = false;

    /// <summary>
    /// Gets or sets the name of the current tournament
    /// </summary>
    public string TournamentName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the current bracket
    /// </summary>
    public string BracketName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the start time of the match
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Gets or sets the current id of a `MatchColor` object in FE
    /// </summary>
    public int CurrentColorsId { get; set; } = 0;

    /// <summary>
    /// Gets or sets if color lock is currently active or not
    /// </summary>
    public bool ColorLockActive { get; set; } = false;
}