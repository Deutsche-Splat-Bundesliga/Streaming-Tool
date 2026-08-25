import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { BroadcastApi } from './broadcast-api';
import { BroadcastState } from '../models/broadcast-state';

describe('BroadcastApi', () => {
  let service: BroadcastApi;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:7000/api/broadcast';

  const mockState: BroadcastState = {
    teamAlphaName: 'Team Alpha',
    teamBravoName: 'Team Bravo',
    alphaIsLeft: true,
    scoreAlpha: 0,
    scoreBravo: 0,
    streamer: '',
    commentator1: '',
    commentator2: '',
    showMapScreen: true,
    showScoreBox: true,
    showCommentatorBox: true,
    showInfobox: true,
    maps: [],
    season: 10,
    division: 1,
    startTime: new Date(),
    week: 1,
    isLeague: false,
    tournamentName: '',
    bracketName: '',
    currentColorsId: 0,
    colorLockActive: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [BroadcastApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BroadcastApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the current broadcast state', () => {
    service.getState().subscribe((state) => {
      expect(state).toEqual(mockState);
    });

    const req = httpMock.expectOne(`${baseUrl}/state`);

    expect(req.request.method).toBe('GET');

    req.flush(mockState);
  });

  it('should update the broadcast state', () => {
    const updatedState: BroadcastState = {
      ...mockState,
      teamAlphaName: 'New Alpha',
      scoreAlpha: 3,
    };

    service.updateState(updatedState).subscribe((state) => {
      expect(state).toEqual(updatedState);
    });

    const req = httpMock.expectOne(`${baseUrl}/state`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(updatedState);

    req.flush(updatedState);
  });
});
