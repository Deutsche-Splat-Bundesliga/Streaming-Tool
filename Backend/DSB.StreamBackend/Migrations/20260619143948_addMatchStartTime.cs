using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class addMatchStartTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "BroadcastStates",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );

            migrationBuilder.UpdateData(
                table: "BroadcastStates",
                keyColumn: "Id",
                keyValue: 1,
                column: "StartTime",
                value: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "StartTime", table: "BroadcastStates");
        }
    }
}
