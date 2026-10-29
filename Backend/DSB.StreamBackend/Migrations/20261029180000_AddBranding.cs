using DSB.StreamBackend.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DSB.StreamBackend.Migrations;

[DbContext(typeof(StreamToolDbContext))]
[Migration("20261029180000_AddBranding")]
public partial class AddBranding : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Branding",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                OrganizationName = table.Column<string>(type: "TEXT", nullable: false),
                OrganizationShortName = table.Column<string>(type: "TEXT", nullable: false),
                TournamentName = table.Column<string>(type: "TEXT", nullable: false),
                LogoUrl = table.Column<string>(type: "TEXT", nullable: false),
                LargeLogoUrl = table.Column<string>(type: "TEXT", nullable: false),
                OutlineLogoUrl = table.Column<string>(type: "TEXT", nullable: false),
                PrimaryColor = table.Column<string>(type: "TEXT", nullable: false),
                SecondaryColor = table.Column<string>(type: "TEXT", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Branding", x => x.Id));

        migrationBuilder.Sql("""
            INSERT INTO "Branding" (
                "Id", "OrganizationName", "OrganizationShortName", "TournamentName",
                "LogoUrl", "LargeLogoUrl", "OutlineLogoUrl", "PrimaryColor", "SecondaryColor"
            ) VALUES (
                1, 'Deutsche Splat Bundesliga', 'DSB', 'Deutsche Splat Bundesliga',
                'assets/dsb/DSB_Logo.png', 'assets/dsb/DSB_Logo-Large.png',
                'assets/dsb/DSB_Outline_White.png', '#501776', '#c4c4c4'
            );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Branding");
    }
}
