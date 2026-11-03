using DSB.StreamBackend.Dtos;
using DSB.StreamBackend.Hubs;
using DSB.StreamBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DSB.StreamBackend.Controllers;

/// <summary>
/// Provides the shared branding profile for the control panel and overlays.
/// </summary>
[ApiController]
[Route("api/branding")]
public class BrandingController(
    BrandingService brandingService,
    BrandingAssetsService brandingAssetsService,
    IHubContext<OverlayHub, IOverlayClient> hub) : ControllerBase
{
    private const long MaxUploadRequestSize = 10 * 1024 * 1024 + 128 * 1024;

    [HttpGet]
    public async Task<ActionResult<BrandingDto>> GetBranding()
    {
        return Ok(await brandingService.GetBrandingAsync());
    }

    [HttpPost]
    public async Task<ActionResult<BrandingDto>> UpdateBranding(BrandingDto branding)
    {
        BrandingDto updatedBranding = await brandingService.UpdateBrandingAsync(branding);
        await hub.Clients.All.BrandingUpdated(updatedBranding);
        return Ok(updatedBranding);
    }

    [HttpPost("assets")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxUploadRequestSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadRequestSize)]
    public async Task<IActionResult> UploadBrandingAsset([FromForm] IFormFile? image)
    {
        if (image is null)
        {
            return BadRequest("An image file is required.");
        }

        try
        {
            BrandingAssetFile asset = await brandingAssetsService.SaveAsync(image);
            string assetUrl = Url.ActionLink(
                nameof(GetBrandingAsset),
                values: new { fileName = asset.FileName }) ??
                throw new InvalidOperationException("Unable to create the branding asset URL.");

            return Created(assetUrl, new { assetUrl });
        }
        catch (BrandingAssetValidationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("assets/{fileName}")]
    public IActionResult GetBrandingAsset(string fileName)
    {
        BrandingAssetFile? asset = brandingAssetsService.Find(fileName);
        return asset is null
            ? NotFound()
            : PhysicalFile(asset.FullPath, asset.ContentType);
    }
}
