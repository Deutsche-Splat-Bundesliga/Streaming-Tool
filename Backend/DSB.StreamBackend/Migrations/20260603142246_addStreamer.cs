using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class addStreamer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Streamer",
                table: "BroadcastStates",
                type: "TEXT",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                column: "Streamer",
                value: ""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Streamer", table: "BroadcastStates");
        }
    }
}
