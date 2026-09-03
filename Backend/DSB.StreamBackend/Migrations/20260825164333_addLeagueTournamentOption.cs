using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class addLeagueTournamentOption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BracketName",
                table: "BroadcastStates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsLeague",
                table: "BroadcastStates",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TournamentName",
                table: "BroadcastStates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BracketName", "IsLeague", "TournamentName" },
                values: new object[] { "", false, "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BracketName",
                table: "BroadcastStates");

            migrationBuilder.DropColumn(
                name: "IsLeague",
                table: "BroadcastStates");

            migrationBuilder.DropColumn(
                name: "TournamentName",
                table: "BroadcastStates");
        }
    }
}
