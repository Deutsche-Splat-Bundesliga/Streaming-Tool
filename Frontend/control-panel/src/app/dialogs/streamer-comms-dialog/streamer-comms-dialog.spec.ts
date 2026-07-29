import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamerCommsDialog } from './streamer-comms-dialog';
import { BroadcastState } from '../../models/broadcast-state';
import { signal } from '@angular/core';
import { BroadcastStateService } from '../../services/broadcast-state';

describe('StreamerCommsDialog', () => {
  let component: StreamerCommsDialog;
  let fixture: ComponentFixture<StreamerCommsDialog>;

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

  const mockState = signal<BroadcastState>(defaultState);

  const mockStateService = {
    state: mockState,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamerCommsDialog],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamerCommsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject BroadcastStateService', () => {
    expect(component.stateService).toBe(mockStateService);
  });

  it('should expose state signal from BroadcastStateService', () => {
    expect(component.state).toBe(mockStateService.state);
    expect(component.state()).toEqual(defaultState);
  });
});
