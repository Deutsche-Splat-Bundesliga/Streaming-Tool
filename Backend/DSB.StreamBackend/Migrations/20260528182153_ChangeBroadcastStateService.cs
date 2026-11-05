using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeBroadcastStateService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Division",
                table: "BroadcastStates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "Season",
                table: "BroadcastStates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Division", "Season" },
                values: new object[] { 0, 0 }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Division", table: "BroadcastStates");

            migrationBuilder.DropColumn(name: "Season", table: "BroadcastStates");
        }
    }
}
