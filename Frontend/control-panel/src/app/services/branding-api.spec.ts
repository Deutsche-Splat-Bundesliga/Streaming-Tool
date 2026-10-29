import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { BrandingApi } from './branding-api';
import { Branding } from '../models/branding';

describe('BrandingApi', () => {
  let service: BrandingApi;
  let httpMock: HttpTestingController;

  const url = 'http://localhost:7000/api/branding';
  const branding: Branding = {
    organizationName: 'Example Organization',
    organizationShortName: 'EX',
    tournamentName: 'Example Cup',
    logoUrl: 'assets/example/logo.png',
    largeLogoUrl: 'assets/example/logo-large.png',
    outlineLogoUrl: 'assets/example/logo-outline.png',
    primaryColor: '#123456',
    secondaryColor: '#abcdef',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrandingApi, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BrandingApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets branding from the endpoint', () => {
    service.getBranding().subscribe((result) => expect(result).toEqual(branding));

    const request = httpMock.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush(branding);
  });

  it('updates branding through the endpoint', () => {
    service.updateBranding(branding).subscribe((result) => expect(result).toEqual(branding));

    const request = httpMock.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(branding);
    request.flush(branding);
  });

  it('uploads an image as multipart form data', () => {
    const image = new File(['image'], 'logo.png', { type: 'image/png' });
    const response = { assetUrl: `${url}/assets/example.png` };

    service.uploadAsset(image).subscribe((result) => expect(result).toEqual(response));

    const request = httpMock.expectOne(`${url}/assets`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    const uploadedImage = (request.request.body as FormData).get('image');
    expect(uploadedImage).toMatchObject({ name: 'logo.png', type: 'image/png' });
    request.flush(response);
  });
});
