import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { App } from './app';
import { signal } from '@angular/core';
import { BroadcastStateService } from './services/broadcast-state';
import { BroadcastState } from './models/broadcast-state';
import { Socials } from './models/socials';
import { CommentatorBoxTimeData } from './models/commentator-box-time-data';
import { SocialsService } from './services/socials';
import { CommentatorBoxTimeDataService } from './services/commentator-box-time-data';
import { CommBoxDisplayMode } from './enums/comm-box-display-modes';
import { Division } from './models/division';
import { getTranslocoModule } from './transloco-testing.module';

describe('App', () => {
  let component: App;

  const mockState = signal<BroadcastState>({
    teamAlphaName: '',
    teamBravoName: '',
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
    division: 3,
    startTime: new Date(),
    week: 1,
    isLeague: false,
    tournamentName: '',
    bracketName: '',
    currentColorsId: 0,
    colorLockActive: false,
  });

  const availableDivisions: Division[] = [
    { id: 1, name: 'Division 1', color: '#FF0000' },
    { id: 2, name: 'Division 2', color: '#FF8800' },
    { id: 3, name: 'Division 3', color: '#FFFF00' },
  ];

  const mockStateService = {
    state: mockState,
    availableDivisions,
  };

  const mockSocials = signal<Socials>({
    xHandle: '@Test',
    discordInvite: 'DSB',
  });

  const mockTimeData = signal<CommentatorBoxTimeData>({
    hideDisplayIntervalInSeconds: 6,
    showDisplayIntervalInSeconds: 4,
    displayMode: CommBoxDisplayMode.Manual,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, getTranslocoModule()],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
        {
          provide: SocialsService,
          useValue: {
            socials: mockSocials,
          },
        },
        {
          provide: CommentatorBoxTimeDataService,
          useValue: {
            commentatorBoxTimeData: mockTimeData,
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--current-division-color');
    TestBed.resetTestingModule();
  });

  it('should create the app', () => {
    const fixture: ComponentFixture<App> = TestBed.createComponent(App);
    const app: App = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have signal reachable', () => {
    const fixture: ComponentFixture<App> = TestBed.createComponent(App);
    const app: App = fixture.componentInstance;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((app as any).title()).toBe('control-panel');
  });

  it('should set current division color css variable after render', async () => {
    const fixture: ComponentFixture<App> = TestBed.createComponent(App);

    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();

    expect(document.documentElement.style.getPropertyValue('--current-division-color')).toBe(
      component.stateService.availableDivisions[2].color,
    );
  });
});
