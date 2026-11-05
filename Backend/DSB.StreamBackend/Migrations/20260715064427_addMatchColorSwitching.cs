using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class addMatchColorSwitching : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ColorLockActive",
                table: "BroadcastStates",
                type: "INTEGER",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<int>(
                name: "CurrentColorsId",
                table: "BroadcastStates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ColorLockActive", "CurrentColorsId" },
                values: new object[] { false, 0 }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ColorLockActive", table: "BroadcastStates");

            migrationBuilder.DropColumn(name: "CurrentColorsId", table: "BroadcastStates");
        }
    }
}
