namespace DSB.StreamBackend.Models;

/// <summary>
/// Represents the current broadcast state for a streaming match,
/// including team names, scores, commentator information, and display flags.
/// </summary>
public class BroadcastStateEntity
{
    /// <summary>
    /// Gets or sets the single identifier for the broadcast state.
    /// </summary>
    public int Id { get; set; } = 1;

    /// <summary>
    /// Gets or sets the name of Team Alpha.
    /// </summary>
    public string TeamAlphaName { get; set; } = "Team Alpha";

    /// <summary>
    /// Gets or sets the name of Team Bravo.
    /// </summary>
    public string TeamBravoName { get; set; } = "Team Bravo";

    /// <summary>
    /// Gets or sets a value indicating whether Team Alpha is shown on the left side of the layout.
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
    /// Gets or sets the name of the first commentator.
    /// </summary>
    public string Commentator1 { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the second commentator.
    /// </summary>
    public string Commentator2 { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the map screen is visible.
    /// </summary>
    public bool ShowMapScreen { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the score box is visible.
    /// </summary>
    public bool ShowScoreBox { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the commentator box is visible.
    /// </summary>
    public bool ShowCommentatorBox { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the infobox is visible.
    /// </summary>
    public bool ShowInfobox { get; set; } = true;

    /// <summary>
    /// Gets or sets the collection of map states associated with the broadcast.
    /// </summary>
    public List<MapStateEntity> Maps { get; set; } = [];

    /// <summary>
    /// Gets or sets the current season number for the broadcast.
    /// </summary>
    public int Season { get; set; }

    /// <summary>
    /// Gets or sets the current division number for the broadcast.
    /// </summary>
    public int Division { get; set; }

    /// <summary>
    /// Gets or sets the current week number for the broadcast.
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
