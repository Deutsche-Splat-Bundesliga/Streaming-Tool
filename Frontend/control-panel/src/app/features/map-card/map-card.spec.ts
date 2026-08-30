import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MapCard } from './map-card';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { MapState } from '../../models/map-state';
import { Map } from '../../models/map';
import { Mode } from '../../models/mode';
import { LogService } from '../../services/log';

describe('MapCard', () => {
  let component: MapCard;
  let fixture: ComponentFixture<MapCard>;

  const map: MapState = {
    id: 'map-1',
    order: 1,
    mapId: 'scorch-gorge',
    modeId: 'sz',
    isVisible: true,
  };

  const secondMap: MapState = {
    id: 'map-2',
    order: 2,
    mapId: 'eeltail-alley',
    modeId: 'tc',
    isVisible: true,
    winner: 'bravo',
  };

  const defaultState: BroadcastState = {
    teamAlphaName: 'Team Alpha',
    teamBravoName: 'Team Bravo',
    alphaIsLeft: true,
    scoreAlpha: 0,
    scoreBravo: 1,
    streamer: '',
    commentator1: '',
    commentator2: '',
    showMapScreen: true,
    showScoreBox: true,
    showCommentatorBox: true,
    showInfobox: true,
    maps: [map, secondMap],
    season: 10,
    division: 1,
    startTime: new Date(),
    week: 1,
    currentColorsId: 0,
    colorLockActive: false,
  };

  const availableMaps: WritableSignal<Map[]> = signal<Map[]>([
    {
      id: 'scorch-gorge',
      mapName: 'Sengkluft',
    },
    {
      id: 'eeltail-alley',
      mapName: 'Streifenaal-Straße',
    },
  ]);

  const availableModes: WritableSignal<Mode[]> = signal<Mode[]>([
    {
      id: 'sz',
      name: 'Herrschaft',
    },
    {
      id: 'tc',
      name: 'Turm-Kommando',
    },
  ]);

  const mockState = signal<BroadcastState>(defaultState);

  const mockStateService = {
    state: mockState,
    availableMaps,
    availableModes,
    update: vi.fn(),
    removeMap: vi.fn(),
  };

  const mockLogService = {
    beginScope: vi.fn().mockReturnValue({
      dispose: vi.fn(),
    }),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockState.set(defaultState);

    await TestBed.configureTestingModule({
      imports: [MapCard],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    })
      .overrideComponent(MapCard, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MapCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('map', map);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should expose state from BroadcastStateService', () => {
    expect(component.state).toBe(mockStateService.state);
    expect(component.state()).toEqual(defaultState);
  });

  it('should expose available maps from BroadcastStateService', () => {
    expect(component.availableMaps).toBe(mockStateService.availableMaps);
  });

  it('should expose available modes from BroadcastStateService', () => {
    expect(component.availableModes).toBe(mockStateService.availableModes);
  });

  it('should initialize edit menu as closed', () => {
    expect(component.showEditMenu).toBe(false);
  });

  it('should open edit menu', () => {
    component.openEditMenu();

    expect(component.showEditMenu).toBe(true);
  });

  it('should close edit menu', () => {
    component.showEditMenu = true;

    component.closeEditMenu();

    expect(component.showEditMenu).toBe(false);
  });

  it('should remove current map', () => {
    component.removeMap();

    expect(mockStateService.removeMap).toHaveBeenCalledWith('map-1');
  });

  it('should set winner to alpha and recalculate scores', () => {
    component.setWinner('alpha');

    expect(mockStateService.update).toHaveBeenCalledWith({
      maps: [
        {
          ...map,
          winner: 'alpha',
        },
        secondMap,
      ],
      scoreAlpha: 1,
      scoreBravo: 1,
    });
  });

  it('should set winner to bravo and recalculate scores', () => {
    component.setWinner('bravo');

    expect(mockStateService.update).toHaveBeenCalledWith({
      maps: [
        {
          ...map,
          winner: 'bravo',
        },
        secondMap,
      ],
      scoreAlpha: 0,
      scoreBravo: 2,
    });
  });

  it('should clear winner when setting winner to null', () => {
    mockState.set({
      ...defaultState,
      maps: [
        {
          ...map,
          winner: 'alpha',
        },
        secondMap,
      ],
    });

    component.setWinner(null);

    expect(mockStateService.update).toHaveBeenCalledWith({
      maps: [
        {
          ...map,
          winner: null,
        },
        secondMap,
      ],
      scoreAlpha: 0,
      scoreBravo: 1,
    });
  });

  it('should select winner if winner is not already selected', () => {
    const setWinnerSpy = vi.spyOn(component, 'setWinner');

    component.handleWinnerSelection('alpha');

    expect(setWinnerSpy).toHaveBeenCalledWith('alpha');
  });

  it('should clear winner if same winner is selected again', () => {
    mockState.set({
      ...defaultState,
      maps: [
        {
          ...map,
          winner: 'alpha',
        },
        secondMap,
      ],
    });

    const setWinnerSpy = vi.spyOn(component, 'setWinner');

    component.handleWinnerSelection('alpha');

    expect(setWinnerSpy).toHaveBeenCalledWith(null);
  });

  it('should update map information', () => {
    component.updateMap('eeltail-alley');

    expect(mockStateService.update).toHaveBeenCalledWith({
      maps: [
        {
          ...map,
          mapId: 'eeltail-alley',
        },
        secondMap,
      ],
    });
  });

  it('should not update map when selected map does not exist', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.updateMap('unknown-map');

    expect(mockStateService.update).not.toHaveBeenCalled();
    expect(mockLogService.error).toHaveBeenCalledWith('Selected map not found', {
      mapId: 'unknown-map',
    });

    consoleErrorSpy.mockRestore();
  });

  it('should update mode information', () => {
    component.updateMode('tc');

    expect(mockStateService.update).toHaveBeenCalledWith({
      maps: [
        {
          ...map,
          modeId: 'tc',
        },
        secondMap,
      ],
    });
  });

  it('should not update mode when selected mode does not exist', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.updateMode('unknown-mode');

    expect(mockStateService.update).not.toHaveBeenCalled();
    expect(mockLogService.error).toHaveBeenCalledWith('Selected mode not found', {
      modeId: 'unknown-mode',
    });

    consoleErrorSpy.mockRestore();
  });

  it('should set isVisible property and update it', () => {
    mockState.set({
      ...defaultState,
      maps: [
        map,
        {
          ...secondMap,
          isVisible: false,
        },
      ],
    });

    expect(component.state()).toEqual({
      ...defaultState,
      maps: [
        map,
        {
          ...secondMap,
          isVisible: false,
        },
      ],
    });
  });
});
