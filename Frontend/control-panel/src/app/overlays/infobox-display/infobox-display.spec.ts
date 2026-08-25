import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InfoboxDisplay } from './infobox-display';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';
import { SocialsService } from '../../services/socials';
import { CommentatorBoxTimeData } from '../../models/commentator-box-time-data';
import { Socials } from '../../models/socials';
import { LogService } from '../../services/log';
import { CommBoxDisplayMode } from '../../enums/comm-box-display-modes';

describe('InfoboxDisplay', () => {
  let component: InfoboxDisplay;
  let fixture: ComponentFixture<InfoboxDisplay>;

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
    startTime: new Date(),
    week: 1,
    isLeague: false,
    tournamentName: '',
    bracketName: '',
    currentColorsId: 0,
    colorLockActive: false,
  };

  const mockState = signal<BroadcastState>(defaultState);
  const mockTimeData = signal<CommentatorBoxTimeData>({
    showDisplayIntervalInSeconds: 1,
    hideDisplayIntervalInSeconds: 2,
    displayMode: CommBoxDisplayMode.Manual,
  });
  const mockSocials = signal<Socials>({
    xHandle: '@Temp',
    discordInvite: 'Temp',
  });

  const mockStateService = {
    state: mockState,
    loadInitialState: vi.fn(),
  };

  const mockTimeDataService = {
    commentatorBoxTimeData: mockTimeData,
    loadInitialState: vi.fn(),
  };

  const mockSocialsService = {
    socials: mockSocials,
    loadInitialState: vi.fn(),
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
    mockState.set(defaultState);

    await TestBed.configureTestingModule({
      imports: [InfoboxDisplay],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
        {
          provide: CommentatorBoxTimeDataService,
          useValue: mockTimeDataService,
        },
        {
          provide: SocialsService,
          useValue: mockSocialsService,
        },
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    }).compileComponents();

    vi.clearAllMocks();

    fixture = TestBed.createComponent(InfoboxDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should inject BroadcastStateService', () => {
    expect(component.stateService).toBe(mockStateService);
  });

  it('should expose the state signal from BroadcastStateService', () => {
    expect(component.state).toBe(mockStateService.state);
    expect(component.state()).toEqual(defaultState);
  });

  it('should call loadInitialState on init', () => {
    vi.clearAllMocks();
    component.ngOnInit();
    expect(mockStateService.loadInitialState).toHaveBeenCalledOnce();
  });

  it('should reflect state changes from BroadcastStateService', () => {
    const updatedState: BroadcastState = {
      ...defaultState,
      streamer: 'Test Streamer',
      commentator1: 'Caster One',
      commentator2: 'Caster Two',
      showInfobox: false,
    };

    mockState.set(updatedState);

    expect(component.state()).toEqual(updatedState);
  });
});
