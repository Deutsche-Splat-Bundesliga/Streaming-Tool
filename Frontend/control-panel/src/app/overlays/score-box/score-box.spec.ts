import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScoreBox } from './score-box';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { LogService } from '../../services/log';

describe('ScoreBox', () => {
  let component: ScoreBox;
  let fixture: ComponentFixture<ScoreBox>;

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
      imports: [ScoreBox],
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
      .overrideComponent(ScoreBox, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ScoreBox);
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

  it('should load initial state on init', () => {
    expect(mockStateService.loadInitialState).toHaveBeenCalledOnce();
  });
});
