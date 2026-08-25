import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Dashboard } from './dashboard';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { LogService } from '../../services/log';

@Component({
  selector: 'app-map-card',
  template: '',
})
class MockMapCard {}

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

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

  const mockStateService = {
    state: mockState,
    addMap: vi.fn(),
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
      imports: [Dashboard],
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
      .overrideComponent(Dashboard, {
        remove: {
          imports: [],
        },
        add: {
          imports: [MockMapCard],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
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

  it('should reflect state changes from BroadcastStateService', () => {
    const updatedState: BroadcastState = {
      ...defaultState,
      teamAlphaName: 'Updated Alpha',
      scoreAlpha: 2,
    };

    mockState.set(updatedState);

    expect(component.state()).toEqual(updatedState);
  });

  it('should call addMap on BroadcastStateService', () => {
    component.addMap();

    expect(mockStateService.addMap).toHaveBeenCalledOnce();
  });
});
