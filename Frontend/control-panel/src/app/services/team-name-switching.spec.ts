import { TestBed } from '@angular/core/testing';

import { TeamNameSwitchingService } from './team-name-switching';
import { BroadcastState } from '../models/broadcast-state';
import { signal } from '@angular/core';
import { BroadcastStateService } from './broadcast-state';

describe('TeamNameSwitchingService', () => {
  let service: TeamNameSwitchingService;
  const defaultState: BroadcastState = {
    teamAlphaName: 'Team Alpha',
    teamBravoName: 'Team Bravo',
    alphaIsLeft: true,
    scoreAlpha: 2,
    scoreBravo: 1,
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

  const mockState = signal<BroadcastState>(defaultState);

  const mockStateService = {
    state: mockState,
    loadInitialState: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockState.set(defaultState);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
      ],
    });
    service = TestBed.inject(TeamNameSwitchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return alpha team name as left team name when alpha is left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: true,
      teamAlphaName: 'Alpha',
      teamBravoName: 'Bravo',
    });

    expect(service.leftTeamName).toBe('Alpha');
  });

  it('should return bravo team name as right team name when alpha is left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: true,
      teamAlphaName: 'Alpha',
      teamBravoName: 'Bravo',
    });

    expect(service.rightTeamName).toBe('Bravo');
  });

  it('should return alpha score as left score when alpha is left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: true,
      scoreAlpha: 5,
      scoreBravo: 3,
    });

    expect(service.leftScore).toBe(5);
  });

  it('should return bravo score as right score when alpha is left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: true,
      scoreAlpha: 5,
      scoreBravo: 3,
    });

    expect(service.rightScore).toBe(3);
  });

  it('should return bravo team name as left team name when alpha is not left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: false,
      teamAlphaName: 'Alpha',
      teamBravoName: 'Bravo',
    });

    expect(service.leftTeamName).toBe('Bravo');
  });

  it('should return alpha team name as right team name when alpha is not left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: false,
      teamAlphaName: 'Alpha',
      teamBravoName: 'Bravo',
    });

    expect(service.rightTeamName).toBe('Alpha');
  });

  it('should return bravo score as left score when alpha is not left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: false,
      scoreAlpha: 5,
      scoreBravo: 3,
    });

    expect(service.leftScore).toBe(3);
  });

  it('should return alpha score as right score when alpha is not left', () => {
    mockState.set({
      ...defaultState,
      alphaIsLeft: false,
      scoreAlpha: 5,
      scoreBravo: 3,
    });

    expect(service.rightScore).toBe(5);
  });
});
