import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Topbar } from './topbar';
import { BroadcastStateService } from '../../services/broadcast-state';
import { Signalr } from '../../services/signalr';
import { BroadcastState } from '../../models/broadcast-state';
import { LogService } from '../../services/log';
import { getTranslocoModule } from '../../transloco-testing.module';

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;

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
    isLeague: true,
    tournamentName: '',
    bracketName: '',
    currentColorsId: 0,
    colorLockActive: false,
  };

  const mockState = signal<BroadcastState>(defaultState);
  const mockIsConnected = signal<boolean>(false);

  const mockStateService = {
    state: mockState,
  };

  const mockSignalr = {
    isConnected: mockIsConnected,
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
    mockIsConnected.set(false);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Topbar, getTranslocoModule()],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
        {
          provide: Signalr,
          useValue: mockSignalr,
        },
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should expose state signal from BroadcastStateService', () => {
    expect(component.state).toBe(mockStateService.state);
    expect(component.state()).toEqual(defaultState);
  });

  it('should reflect state changes from BroadcastStateService', () => {
    const updatedState: BroadcastState = {
      ...defaultState,
      teamAlphaName: 'Updated Alpha',
      teamBravoName: 'Updated Bravo',
      scoreAlpha: 3,
      scoreBravo: 2,
    };

    mockState.set(updatedState);

    expect(component.state()).toEqual(updatedState);
  });

  it('should expose isConnected signal from Signalr', () => {
    expect(component.isConnected).toBe(mockSignalr.isConnected);
    expect(component.isConnected()).toBe(false);
  });

  it('should reflect SignalR connection changes', () => {
    mockIsConnected.set(true);

    expect(component.isConnected()).toBe(true);

    mockIsConnected.set(false);

    expect(component.isConnected()).toBe(false);
  });
});
