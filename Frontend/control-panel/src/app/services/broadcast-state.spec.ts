import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { BroadcastStateService } from './broadcast-state';
import { BroadcastApi } from './broadcast-api';
import { Signalr } from './signalr';
import { BroadcastState } from '../models/broadcast-state';

describe('BroadcastStateService', () => {
  let service: BroadcastStateService;

  const defaultState: BroadcastState = {
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
    startTime: new Date(0),
    week: 1,
    isLeague: false,
    tournamentName: '',
    bracketName: '',
    currentColorsId: 0,
    colorLockActive: false,
  };

  const mockApi = {
    getState: vi.fn(),
    updateState: vi.fn(),
  };

  const mockLiveState = signal<BroadcastState | null>(null);

  const mockSignalr = {
    liveState: mockLiveState,
    start: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockLiveState.set(null);

    mockApi.getState.mockReturnValue(of(defaultState));
    mockApi.updateState.mockReturnValue(of(undefined));

    mockSignalr.start.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        BroadcastStateService,
        { provide: BroadcastApi, useValue: mockApi },
        { provide: Signalr, useValue: mockSignalr },
      ],
    });

    service = TestBed.inject(BroadcastStateService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start SignalR in constructor', () => {
    expect(mockSignalr.start).toHaveBeenCalled();
  });

  it('should initialize state with default values', () => {
    expect(service.state()).toEqual(defaultState);
  });

  it('should update state when SignalR liveState changes', () => {
    const incomingState: BroadcastState = {
      ...defaultState,
      teamAlphaName: 'Live Alpha',
      teamBravoName: 'Live Bravo',
      scoreAlpha: 4,
      scoreBravo: 2,
    };

    mockLiveState.set(incomingState);

    TestBed.tick();

    expect(service.state()).toEqual(incomingState);
  });

  it('should load initial state from api', () => {
    const apiState: BroadcastState = {
      ...defaultState,
      teamAlphaName: 'Alpha From API',
      teamBravoName: 'Bravo From API',
      scoreAlpha: 2,
      scoreBravo: 1,
    };

    mockApi.getState.mockReturnValue(of(apiState));

    service.loadInitialState();

    expect(mockApi.getState).toHaveBeenCalled();
    expect(service.state()).toEqual(apiState);
  });

  it('should update state and persist it through api', () => {
    service.update({
      teamAlphaName: 'New Alpha',
      scoreAlpha: 3,
    });

    const expectedState: BroadcastState = {
      ...defaultState,
      teamAlphaName: 'New Alpha',
      scoreAlpha: 3,
    };

    expect(service.state()).toEqual(expectedState);
    expect(mockApi.updateState).toHaveBeenCalledWith(expectedState);
  });

  it('should add a map with default map and mode values', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000000');

    service.addMap();

    expect(service.state().maps).toEqual([
      {
        id: '00000000-0000-0000-0000-000000000000',
        order: 1,
        mapId: 'scorch-gorge',
        mapName: 'Sengkluft',
        modeId: 'sz',
        modeName: 'Herrschaft',
        imageUrl: 'assets/maps/scorch-gorge.png',
        isVisible: true,
      },
    ]);

    expect(mockApi.updateState).toHaveBeenCalledWith(service.state());
  });

  it('should add maps with increasing order numbers', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000001')
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000002');

    service.addMap();
    service.addMap();

    expect(service.state().maps[0].order).toBe(1);
    expect(service.state().maps[1].order).toBe(2);
  });

  it('should remove a map and reorder remaining maps', () => {
    service.state.set({
      ...defaultState,
      maps: [
        {
          id: 'map-1',
          order: 1,
          mapId: 'scorch-gorge',
          mapName: 'Sengkluft',
          modeId: 'sz',
          modeName: 'Herrschaft',
          imageUrl: 'assets/maps/scorch-gorge.png',
          isVisible: true,
          winner: 'alpha',
        },
        {
          id: 'map-2',
          order: 2,
          mapId: 'eeltail-alley',
          mapName: 'Streifenaal-Straße',
          modeId: 'tc',
          modeName: 'Turm-Kommando',
          imageUrl: 'assets/maps/eeltail-alley.png',
          isVisible: true,
          winner: 'bravo',
        },
        {
          id: 'map-3',
          order: 3,
          mapId: 'hagglefish-market',
          mapName: 'Schnapperchen-Basar',
          modeId: 'rm',
          modeName: 'Operation Goldfisch',
          imageUrl: 'assets/maps/hagglefish-market.png',
          isVisible: true,
          winner: 'alpha',
        },
      ],
    });

    service.removeMap('map-2');

    expect(service.state().maps).toEqual([
      expect.objectContaining({
        id: 'map-1',
        order: 1,
      }),
      expect.objectContaining({
        id: 'map-3',
        order: 2,
      }),
    ]);

    expect(service.state().scoreAlpha).toBe(2);
    expect(service.state().scoreBravo).toBe(0);
    expect(mockApi.updateState).toHaveBeenCalledWith(service.state());
  });

  it('should expose available maps', () => {
    expect(service.availableMaps.length).toBeGreaterThan(0);

    expect(service.availableMaps[0]).toEqual({
      id: 'scorch-gorge',
      mapName: 'Sengkluft',
      imageUrl: 'assets/maps/scorch-gorge.png',
    });
  });

  it('should expose match colors', () => {
    expect(service.matchColors.length).toBeGreaterThan(0);
    expect(service.matchColors[0]).toEqual({ id: 0, colorAlpha: '#1516CE', colorBravo: '#FCAD24' });
  });

  it('should expose color lock colors', () => {
    expect(service.colorLockColors.length).toBeGreaterThan(0);
    expect(service.colorLockColors[0]).toEqual({
      id: 0,
      colorAlpha: '#DBCA28',
      colorBravo: '#5533E1',
    });
  });

  it('should expose available modes', () => {
    expect(service.availableModes).toEqual([
      {
        id: 'tw',
        name: 'Revierkampf',
      },
      {
        id: 'sz',
        name: 'Herrschaft',
      },
      {
        id: 'tc',
        name: 'Turm-Kommando',
      },
      {
        id: 'rm',
        name: 'Operation Goldfisch',
      },
      {
        id: 'cb',
        name: 'Muschelchaos',
      },
    ]);
  });

  it('should expose available divisions', () => {
    expect(service.availableDivisions).toHaveLength(8);

    expect(service.availableDivisions[0]).toEqual({
      id: 1,
      name: 'Division 1',
      color: '#FF0000',
    });
  });
});
