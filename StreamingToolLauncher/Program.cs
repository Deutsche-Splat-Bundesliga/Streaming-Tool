using System.Diagnostics;
using Microsoft.VisualBasic;

Console.OutputEncoding = System.Text.Encoding.UTF8;

Console.WriteLine("Starting Streaming Tool...");
Console.WriteLine("Checking dependencies...");

if (!CommandExists("node"))
{
    Console.WriteLine("Node.js is not installed.");
    Console.WriteLine("Install it now? (y/N)");
    Console.Write("> ");
    char response = Console.ReadKey().KeyChar;
    Console.WriteLine();
    if (char.ToLower(response) == 'y')
    {
        Console.WriteLine("Installing Node.js using WinGet...");
        bool installed = InstallNode();
        if (installed) Console.WriteLine("Node.js installed successfully.");
        else
        {
            Console.WriteLine("Node.js installation failed. Please install it from https://nodejs.org/en/download");
            Pause();
            return;
        }

        if (!CommandExists("node"))
        {
            Console.WriteLine("Node.js was installed but could not be found.");
            Pause();
            return;
        }
    }
}

if (!DotNet10Exists())
{
    Console.WriteLine(".NET 10 is not installed.");
    Console.WriteLine("Install it now? (y/N)");
    Console.Write("> ");
    char response = Console.ReadKey().KeyChar;
    Console.WriteLine();

    if (char.ToLower(response) == 'y')
    {
        Console.WriteLine("Installing .NET 10 using WinGet...");
        bool installed = InstallDotNet();
        if (installed) Console.WriteLine(".NET 10 installed successfully.");
        else
        {
            Console.WriteLine(".NET 10 installation failed. Please install it from https://dotnet.microsoft.com/en-us/download/dotnet/10.0");
            Pause();
            return;
        }

        if (!DotNet10Exists())
        {
            Console.WriteLine(".NET 10 was installed but could not be found.");
            Pause();
            return;
        }
    }
}

string root = AppContext.BaseDirectory;

string frontend = Path.Combine(root, "Frontend", "control-panel");
string backend = Path.Combine(root, "Backend", "DSB.StreamBackend");

if (!File.Exists(Path.Combine(frontend, "package.json")))
{
    Console.WriteLine("Frontend not found!");
    Pause();
    return;
}

if (!File.Exists(Path.Combine(backend, "DSB.StreamBackend.csproj")))
{
    Console.WriteLine("Backend not found!");
    Pause();
    return;
}

StartCmd("Streaming Tool Frontend", frontend, "npm i && npm start");
StartCmd("Streaming Tool Backend", backend, "dotnet run");

Process.Start(new ProcessStartInfo
{
    FileName = "http://localhost:4200",
    UseShellExecute = true
});

Console.WriteLine("Website opened in the browser.");
Console.WriteLine("Streaming Tool started. This launcher can now be closed.\nPress any key to close...");
Console.ReadKey();

/// <summary>
/// Checks whether a specified command exists on the system
/// </summary>
/// <param name="command">The command to check for</param>
/// <returns>True if the command is found, otherwise false</returns>
static bool CommandExists(string command)
{
    var p = Process.Start(new ProcessStartInfo
    {
        FileName = "cmd.exe",
        Arguments = $"/c where {command}",
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true
    });

    p!.WaitForExit();
    return p.ExitCode == 0;
}

/// <summary>
/// Checks whether .NET 10 is installed on the system
/// </summary>
/// <returns>True if .NET 10 is found, otherwise false</returns>
static bool DotNet10Exists()
{
    if (!CommandExists("dotnet"))
        return false;

    var p = Process.Start(new ProcessStartInfo
    {
        FileName = "cmd.exe",
        Arguments = "/c dotnet --list-sdks",
        RedirectStandardOutput = true,
        UseShellExecute = false,
        CreateNoWindow = true
    });

    var output = p!.StandardOutput.ReadToEnd();
    p.WaitForExit();

    return output.Split('\n').Any(x => x.TrimStart().StartsWith("10."));
}

/// <summary>
/// Starts a new cmd process
/// </summary>
/// <param name="title">The window title</param>
/// <param name="workingDir">The directory to start the cmd process from</param>
/// <param name="command">The command to run</param>
static void StartCmd(string title, string workingDir, string command)
{
    Process.Start(new ProcessStartInfo
    {
        FileName = "cmd.exe",
        Arguments = $"/k title {title} && {command}",
        WorkingDirectory = workingDir,
        UseShellExecute = true,
        WindowStyle = ProcessWindowStyle.Minimized
    });
}

/// <summary>
/// Attempts to install Node.js via WinGet
/// </summary>
/// <returns>True if Node.js was installed successfully, otherwise false</returns>
static bool InstallNode()
{
    Process? p = Process.Start(new ProcessStartInfo
    {
        FileName = "cmd.exe",
        Arguments = "/c winget install -e --id OpenJS.NodeJS",
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true
    });

    if (p is null) return false;

    string output = p.StandardOutput.ReadToEnd();
    string error = p.StandardError.ReadToEnd();
    p.WaitForExit();

    if (p.ExitCode == 0) return true;

    Console.WriteLine("Fehler bei der Installation:");
    if (!string.IsNullOrWhiteSpace(output)) Console.WriteLine(output.Trim());
    if (!string.IsNullOrWhiteSpace(error)) Console.WriteLine(error.Trim());

    return false;
}

/// <summary>
/// Attempts to install .NET 9 via WinGet
/// </summary>
/// <returns>True if .NET 9 was installed successfully, otherwise false</returns>
static bool InstallDotNet()
{
    Process? p = Process.Start(new ProcessStartInfo
    {
        FileName = "cmd.exe",
        Arguments = "/c winget install -e --id Microsoft.DotNet.SDK.9",
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true
    });

    if (p is null) return false;

    string output = p.StandardOutput.ReadToEnd();
    string error = p.StandardError.ReadToEnd();
    p.WaitForExit();

    if (p.ExitCode == 0) return true;

    Console.WriteLine("Fehler bei der Installation:");
    if (!string.IsNullOrWhiteSpace(output)) Console.WriteLine(output.Trim());
    if (!string.IsNullOrWhiteSpace(error)) Console.WriteLine(error.Trim());

    return false;
}

/// <summary>
/// Pauses the program
/// </summary>
static void Pause()
{
    Console.WriteLine("Drücken Sie eine beliebige Taste...");
    Console.ReadKey();
}