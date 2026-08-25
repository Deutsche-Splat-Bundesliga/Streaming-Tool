import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndScreen } from './end-screen';
import { BroadcastState } from '../../models/broadcast-state';
import { signal } from '@angular/core';
import { BroadcastStateService } from '../../services/broadcast-state';
import { Socials } from '../../models/socials';
import { SocialsService } from '../../services/socials';
import { LogService } from '../../services/log';

describe('EndScreen', () => {
  let component: EndScreen;
  let fixture: ComponentFixture<EndScreen>;

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

  const defaultSocials: Socials = {
    xHandle: '@Test',
    discordInvite: 'Test',
  };

  const mockState = signal<BroadcastState>(defaultState);
  const mockSocials = signal<Socials>(defaultSocials);

  const mockStateService = {
    state: mockState,
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
    vi.clearAllMocks();
    mockState.set(defaultState);
    mockSocials.set(defaultSocials);

    await TestBed.configureTestingModule({
      imports: [EndScreen],
      providers: [
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
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

    fixture = TestBed.createComponent(EndScreen);
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

  it('should inject SocialsService', () => {
    expect(component.socialsService).toBe(mockSocialsService);
  });

  it('should expose the state signal from BroadcastStateService', () => {
    expect(component.state).toBe(mockStateService.state);
    expect(component.state()).toEqual(defaultState);
  });

  it('should expose the socials signal from SocialsService', () => {
    expect(component.socials).toBe(mockSocialsService.socials);
    expect(component.socials()).toEqual(defaultSocials);
  });

  it('should load initial state on init', () => {
    expect(mockStateService.loadInitialState).toHaveBeenCalledOnce();
  });

  it('should load initial socials on init', () => {
    expect(mockSocialsService.loadInitialState).toHaveBeenCalledOnce();
  });
});
