using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BroadcastStates",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TeamAlphaName = table.Column<string>(type: "TEXT", nullable: false),
                    TeamBravoName = table.Column<string>(type: "TEXT", nullable: false),
                    AlphaIsLeft = table.Column<bool>(type: "INTEGER", nullable: false),
                    ScoreAlpha = table.Column<int>(type: "INTEGER", nullable: false),
                    ScoreBravo = table.Column<int>(type: "INTEGER", nullable: false),
                    Commentator1 = table.Column<string>(type: "TEXT", nullable: false),
                    Commentator2 = table.Column<string>(type: "TEXT", nullable: false),
                    ShowMapScreen = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowScoreBox = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowCommentatorBox = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowInfobox = table.Column<bool>(type: "INTEGER", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BroadcastStates", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "MapStates",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false),
                    MapId = table.Column<string>(type: "TEXT", nullable: false),
                    MapName = table.Column<string>(type: "TEXT", nullable: false),
                    ModeId = table.Column<string>(type: "TEXT", nullable: false),
                    ModeName = table.Column<string>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Winner = table.Column<string>(type: "TEXT", nullable: true),
                    IsVisible = table.Column<bool>(type: "INTEGER", nullable: false),
                    BroadcastStateEntityId = table.Column<int>(type: "INTEGER", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MapStates_BroadcastStates_BroadcastStateEntityId",
                        column: x => x.BroadcastStateEntityId,
                        principalTable: "BroadcastStates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.InsertData(
                table: "BroadcastStates",
                columns: new[]
                {
                    "Id",
                    "AlphaIsLeft",
                    "Commentator1",
                    "Commentator2",
                    "ScoreAlpha",
                    "ScoreBravo",
                    "ShowCommentatorBox",
                    "ShowInfobox",
                    "ShowMapScreen",
                    "ShowScoreBox",
                    "TeamAlphaName",
                    "TeamBravoName",
                },
                values: new object[]
                {
                    1,
                    true,
                    "",
                    "",
                    0,
                    0,
                    true,
                    true,
                    true,
                    true,
                    "Team Alpha",
                    "Team Bravo",
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_MapStates_BroadcastStateEntityId",
                table: "MapStates",
                column: "BroadcastStateEntityId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MapStates");

            migrationBuilder.DropTable(name: "BroadcastStates");
        }
    }
}
