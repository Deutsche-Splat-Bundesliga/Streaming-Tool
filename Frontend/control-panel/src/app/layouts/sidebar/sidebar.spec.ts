import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Sidebar } from './sidebar';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { Division } from '../../models/division';
import { LogService } from '../../services/log';
import { CommBoxDisplayMode } from '../../enums/comm-box-display-modes';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

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
    currentColorsId: 0,
    colorLockActive: false,
  };

  const availableDivisions: Division[] = [
    { id: 1, name: 'Division 1' },
    { id: 2, name: 'Division 2' },
    { id: 3, name: 'Division 3' },
  ];

  const mockState = signal<BroadcastState>(defaultState);

  const mockStateService = {
    state: mockState,
    availableDivisions,
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
      imports: [Sidebar],
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
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
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

  it('should expose state signal from BroadcastStateService', () => {
    expect(component.state).toBe(mockStateService.state);
    expect(component.state()).toEqual(defaultState);
  });

  it('should reflect state changes from BroadcastStateService', () => {
    const updatedState: BroadcastState = {
      ...defaultState,
      teamAlphaName: 'Updated Alpha',
      teamBravoName: 'Updated Bravo',
      season: 11,
      division: 2,
      week: 5,
    };

    mockState.set(updatedState);

    expect(component.state()).toEqual(updatedState);
  });

  it('should reflect commBoxDisplayMode enum property', () => {
    expect(component.commBoxDisplayMode).toEqual(CommBoxDisplayMode);
  });
});
