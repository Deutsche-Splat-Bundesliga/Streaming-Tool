using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddWeek : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Week",
                table: "BroadcastStates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateTable(
                name: "Socials",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    XHandle = table.Column<string>(type: "TEXT", nullable: false),
                    DiscordInvite = table.Column<string>(type: "TEXT", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Socials", x => x.Id);
                }
            );

            migrationBuilder.InsertData(
                table: "Socials",
                columns: new[] { "Id", "XHandle", "DiscordInvite" },
                values: new object[] { 1, string.Empty, string.Empty }
            );

            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                column: "Week",
                value: 0
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Socials");

            migrationBuilder.DropColumn(name: "Week", table: "BroadcastStates");
        }
    }
}
