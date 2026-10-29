using DSB.StreamBackend.Logging;

namespace DSB.StreamBackend.Services;

public sealed record BrandingAssetFile(string FileName, string ContentType, string FullPath);

public sealed class BrandingAssetValidationException(string message) : Exception(message);

/// <summary>
/// Stores uploaded branding images in the current user's application-data directory.
/// </summary>
public class BrandingAssetsService(ILogService log)
{
    private const long MaxFileSize = 10 * 1024 * 1024;
    private static readonly IReadOnlyDictionary<string, string> SupportedTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".png"] = "image/png",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".webp"] = "image/webp",
            [".gif"] = "image/gif"
        };

    public async Task<BrandingAssetFile> SaveAsync(IFormFile image)
    {
        if (image.Length is <= 0 or > MaxFileSize)
        {
            throw new BrandingAssetValidationException("Image files must be between 1 byte and 10 MB.");
        }

        string extension = Path.GetExtension(image.FileName);
        if (!SupportedTypes.TryGetValue(extension, out string? contentType))
        {
            throw new BrandingAssetValidationException("Only PNG, JPEG, WebP, and GIF images are supported.");
        }

        await using (Stream signatureStream = image.OpenReadStream())
        {
            if (!await HasExpectedSignatureAsync(signatureStream, extension))
            {
                throw new BrandingAssetValidationException("The file contents do not match a supported image format.");
            }
        }

        string fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        string directory = GetStorageDirectory();
        Directory.CreateDirectory(directory);
        string fullPath = Path.Combine(directory, fileName);

        await using (Stream source = image.OpenReadStream())
        await using (var destination = new FileStream(
            fullPath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81920,
            useAsync: true))
        {
            await source.CopyToAsync(destination);
        }

        await log.InfoAsync("Branding image uploaded", new { fileName, contentType, image.Length });
        return new BrandingAssetFile(fileName, contentType, fullPath);
    }

    public BrandingAssetFile? Find(string fileName)
    {
        if (!Guid.TryParseExact(Path.GetFileNameWithoutExtension(fileName), "N", out _) ||
            Path.GetFileName(fileName) != fileName)
        {
            return null;
        }

        string extension = Path.GetExtension(fileName);
        if (!SupportedTypes.TryGetValue(extension, out string? contentType))
        {
            return null;
        }

        string fullPath = Path.Combine(GetStorageDirectory(), fileName);
        return File.Exists(fullPath)
            ? new BrandingAssetFile(fileName, contentType, fullPath)
            : null;
    }

    private static string GetStorageDirectory()
    {
        string appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        if (string.IsNullOrWhiteSpace(appDataPath))
        {
            throw new InvalidOperationException("The local application-data directory is unavailable.");
        }

        return Path.Combine(appDataPath, "StreamingTool", "branding-assets");
    }

    private static async Task<bool> HasExpectedSignatureAsync(Stream stream, string extension)
    {
        byte[] header = new byte[12];
        int totalRead = 0;
        while (totalRead < header.Length)
        {
            int read = await stream.ReadAsync(header.AsMemory(totalRead));
            if (read == 0)
            {
                break;
            }

            totalRead += read;
        }

        return extension.ToLowerInvariant() switch
        {
            ".png" => totalRead >= 8 &&
                      header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".jpg" or ".jpeg" => totalRead >= 3 &&
                                 header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
            ".webp" => totalRead >= 12 &&
                       header.AsSpan(0, 4).SequenceEqual("RIFF"u8) &&
                       header.AsSpan(8, 4).SequenceEqual("WEBP"u8),
            ".gif" => totalRead >= 6 &&
                      (header.AsSpan(0, 6).SequenceEqual("GIF87a"u8) ||
                       header.AsSpan(0, 6).SequenceEqual("GIF89a"u8)),
            _ => false
        };
    }
}
