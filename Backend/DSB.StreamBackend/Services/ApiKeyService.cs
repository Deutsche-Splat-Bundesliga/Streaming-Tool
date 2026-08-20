using System.Security.Cryptography;
using System.Text;
using DSB.StreamBackend.Context;
using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Enums;
using DSB.StreamBackend.Logging;
using DSB.StreamBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DSB.StreamBackend.Services;

/// <summary>
/// Contains all business logic related to API keys.
/// Keys are stored as SHA-256 hashes only; the plaintext is returned exactly once at creation.
/// </summary>
/// <param name="db">The database context</param>
public class ApiKeyService(StreamToolDbContext db, ILogService log)
{
    /// <summary>
    /// Prefix every generated key starts with (stt = streaming tool),
    /// so keys are recognizable in configs and logs.
    /// </summary>
    public const string KeyPrefix = "stt_";

    /// <summary>
    /// Number of characters of the plaintext key that are stored for display purposes.
    /// </summary>
    private const int DisplayPrefixLength = 12;

    /// <summary>
    /// Asynchronously gets all issued API keys (metadata only, never hashes or plaintext)
    /// </summary>
    /// <returns>A <see cref="Task"/> object returning a list of <see cref="ApiKeyDto"/>s</returns>
    public async Task<List<ApiKeyDto>> GetKeysAsync()
    {
        using IDisposable scope = log.BeginScope(nameof(GetKeysAsync));

        await log.DebugAsync("Loading API keys");

        try
        {
            List<ApiKeyEntity> entities = await db.ApiKeys
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            await log.InfoAsync("API keys loaded", new { Count = entities.Count });

            return [.. entities.Select(ToDto)];
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to load API keys", ex);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously creates a new API key
    /// </summary>
    /// <param name="request">The <see cref="CreateApiKeyRequestDto"/> containing name and access level</param>
    /// <returns>An <see cref="ApiKeyCreatedDto"/> containing the plaintext key (shown exactly once)</returns>
    public async Task<ApiKeyCreatedDto> CreateKeyAsync(CreateApiKeyRequestDto request)
    {
        using IDisposable scope = log.BeginScope(nameof(CreateKeyAsync));

        string name = request.Name.Trim();

        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("API key name must not be empty", nameof(request));
        }

        int accessLevel = Enum.IsDefined(typeof(ApiKeyAccessLevel), request.AccessLevel)
            ? request.AccessLevel
            : (int)ApiKeyAccessLevel.ReadWrite;

        await log.InfoAsync("Creating API key", new { name, accessLevel });

        try
        {
            string plaintextKey = GenerateKey();

            ApiKeyEntity entity = new()
            {
                Name = name,
                KeyPrefix = plaintextKey[..DisplayPrefixLength],
                KeyHash = ComputeHash(plaintextKey),
                AccessLevel = accessLevel,
                CreatedAt = DateTime.UtcNow
            };

            db.ApiKeys.Add(entity);

            await db.SaveChangesAsync();

            await log.InfoAsync("API key created", new { entity.Id, entity.Name, entity.KeyPrefix });

            return new ApiKeyCreatedDto
            {
                Key = plaintextKey,
                ApiKey = ToDto(entity)
            };
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to create API key", ex);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously deletes (revokes) an API key
    /// </summary>
    /// <param name="id">The id of the key to delete</param>
    /// <returns>True if the key was found and deleted, otherwise false</returns>
    public async Task<bool> DeleteKeyAsync(string id)
    {
        using IDisposable scope = log.BeginScope(nameof(DeleteKeyAsync));

        await log.InfoAsync("Deleting API key", new { id });

        try
        {
            ApiKeyEntity? entity = await db.ApiKeys.FirstOrDefaultAsync(x => x.Id == id);

            if (entity is null)
            {
                await log.WarningAsync("API key not found", new { id });
                return false;
            }

            db.ApiKeys.Remove(entity);

            await db.SaveChangesAsync();

            await log.InfoAsync("API key deleted", new { id, entity.Name });

            return true;
        }
        catch (Exception ex)
        {
            await log.ErrorAsync("Failed to delete API key", ex);
            throw;
        }
    }

    /// <summary>
    /// Asynchronously validates a plaintext API key and updates its last-used timestamp
    /// </summary>
    /// <param name="plaintextKey">The plaintext key from the request header</param>
    /// <returns>The matching <see cref="ApiKeyEntity"/>, or null if the key is unknown</returns>
    public async Task<ApiKeyEntity?> ValidateKeyAsync(string plaintextKey)
    {
        using IDisposable scope = log.BeginScope(nameof(ValidateKeyAsync));

        string hash = ComputeHash(plaintextKey);

        ApiKeyEntity? entity = await db.ApiKeys.FirstOrDefaultAsync(x => x.KeyHash == hash);

        if (entity is null)
        {
            await log.WarningAsync("Rejected unknown API key");
            return null;
        }

        entity.LastUsedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await log.DebugAsync("API key validated", new { entity.Name });

        return entity;
    }

    /// <summary>
    /// Generates a new random plaintext API key (prefix + 48 hex characters)
    /// </summary>
    /// <returns>The generated plaintext key</returns>
    private static string GenerateKey()
    {
        return KeyPrefix + Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();
    }

    /// <summary>
    /// Computes the SHA-256 hash (lowercase hex) of a plaintext key
    /// </summary>
    /// <param name="plaintextKey">The plaintext key to hash</param>
    /// <returns>The hash as lowercase hex string</returns>
    private static string ComputeHash(string plaintextKey)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plaintextKey))).ToLowerInvariant();
    }

    /// <summary>
    /// Converts the <see cref="ApiKeyEntity"/> to an <see cref="ApiKeyDto"/>
    /// </summary>
    /// <param name="entity">The <see cref="ApiKeyEntity"/> to convert</param>
    /// <returns>The resulting <see cref="ApiKeyDto"/></returns>
    private static ApiKeyDto ToDto(ApiKeyEntity entity)
    {
        return new ApiKeyDto
        {
            Id = entity.Id,
            Name = entity.Name,
            KeyPrefix = entity.KeyPrefix,
            AccessLevel = entity.AccessLevel,
            CreatedAt = entity.CreatedAt,
            LastUsedAt = entity.LastUsedAt
        };
    }
}
