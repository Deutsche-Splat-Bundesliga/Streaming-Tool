using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDbModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Division", "Season" },
                values: new object[] { 1, 10 }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Division", "Season" },
                values: new object[] { 0, 0 }
            );
        }
    }
}
