using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentatorBoxTimeData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CommentatorBoxTimeData",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShowDisplayIntervalInSeconds = table.Column<int>(
                        type: "INTEGER",
                        nullable: false
                    ),
                    HideDisplayIntervalInSeconds = table.Column<int>(
                        type: "INTEGER",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentatorBoxTimeData", x => x.Id);
                }
            );

            migrationBuilder.InsertData(
                table: "CommentatorBoxTimeData",
                columns: new[]
                {
                    "Id",
                    "ShowDisplayIntervalInSeconds",
                    "HideDisplayIntervalInSeconds",
                },
                values: new object[] { 1, 50, 5 }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "CommentatorBoxTimeData");
        }
    }
}
