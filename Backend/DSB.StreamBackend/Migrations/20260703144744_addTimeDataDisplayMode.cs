using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class addTimeDataDisplayMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayMode",
                table: "CommentatorBoxTimeData",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DisplayMode", table: "CommentatorBoxTimeData");
        }
    }
}
