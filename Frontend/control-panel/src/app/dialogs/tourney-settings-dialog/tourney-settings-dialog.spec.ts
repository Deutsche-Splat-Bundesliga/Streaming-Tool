import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourneySettingsDialog } from './tourney-settings-dialog';
import { BroadcastState } from '../../models/broadcast-state';
import { signal } from '@angular/core';
import { Division } from '../../models/division';
import { BroadcastStateService } from '../../services/broadcast-state';

describe('TourneySettingsDialog', () => {
  let component: TourneySettingsDialog;
  let fixture: ComponentFixture<TourneySettingsDialog>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourneySettingsDialog],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TourneySettingsDialog);
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

  it('should expose available divisions from BroadcastStateService', () => {
    expect(component.availableDivisions).toBe(mockStateService.availableDivisions);

    expect(component.availableDivisions).toEqual([
      { id: 1, name: 'Division 1' },
      { id: 2, name: 'Division 2' },
      { id: 3, name: 'Division 3' },
    ]);
  });
});
