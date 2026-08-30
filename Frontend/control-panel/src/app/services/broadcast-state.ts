import {
  afterRenderEffect,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { BroadcastApi } from './broadcast-api';
import { Signalr } from './signalr';
import { BroadcastState } from '../models/broadcast-state';
import { Division } from '../models/division';
import { Map } from '../models/map';
import { Mode } from '../models/mode';
import { SignalrServiceConnection } from '../enums/SignalrServiceConnection';
import { LogService } from './log';
import { MatchColor } from '../models/match-color';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class BroadcastStateService {
  private readonly _api = inject(BroadcastApi);
  private readonly _signalr = inject(Signalr);
  private readonly _log = inject(LogService);

  private _translocoService: TranslocoService = inject(TranslocoService);

  constructor() {
    const scope = this._log.beginScope('BroadcastStateService');

    this._log.info('Initializing BroadcastStateService');

    effect(() => {
      const incoming = this._signalr.liveState();

      if (!incoming) return;

      this._log.debug('SignalR broadcast state received', incoming);

      this.state.set(incoming);

      this._log.info('Broadcast state updated from SignalR');
    });

    // Translate our maps whenever the current active language changes
    afterRenderEffect(() => {
      const currentLanguage = this._translocoService.activeLang();
      this._log.trace('New language selected, translating all map names', {
        newLanguage: currentLanguage,
      });

      untracked(() => {
        const availableMaps = this.availableMaps()
          .map((map) => {
            const currentMapName = this._translocoService.translate(`map.${map.id}`);

            return { ...map, mapName: currentMapName };
          })
          .sort((a, b) => {
            if (a.mapName < b.mapName) return -1;
            if (a.mapName > b.mapName) return 1;
            return 0;
          });

        this.availableMaps.set(availableMaps);
      });
    });

    this._signalr.connectionType = SignalrServiceConnection.BroadcastState;

    this._signalr.start();

    this._log.info('SignalR connection started (BroadcastState)');

    scope.dispose();
  }

  /**
   * Available data
   */
  availableMaps: WritableSignal<Map[]> = signal<Map[]>([
    {
      id: 'scorch-gorge',
      mapName: 'Sengkluft',
    },
    {
      id: 'eeltail-alley',
      mapName: 'Streifenaal-Straße',
    },
    {
      id: 'hagglefish-market',
      mapName: 'Schnapperchen-Basar',
    },
    {
      id: 'undertow-spillway',
      mapName: 'Schwertmuschel-Reservoir',
    },
    {
      id: 'mincemeat-metalworks',
      mapName: 'Aalstahl-Metallwerk',
    },
    {
      id: 'hammerhead-bridge',
      mapName: 'Makrelenbrücke',
    },
    {
      id: 'museum-dalfonsino',
      mapName: 'Pinakoithek',
    },
    {
      id: 'mahi-mahi-resort',
      mapName: 'Mahi-Mahi-Resort',
    },
    {
      id: 'inkblot-art-academy',
      mapName: 'Perlmutt-Akademie',
    },
    {
      id: 'sturgeon-shipyard',
      mapName: 'Störwerft',
    },
    {
      id: 'makomart',
      mapName: 'Cetacea-Markt',
    },
    {
      id: 'wahoo-world',
      mapName: 'Flunder-Funpark',
    },
    {
      id: 'brinewater-springs',
      mapName: 'Kusaya-Quellen',
    },
    {
      id: 'flounder-heights',
      mapName: 'Schollensiedlung',
    },
    {
      id: 'umami-ruins',
      mapName: "Um'ami-Ruinen",
    },
    {
      id: 'manta-maria',
      mapName: 'Manta Maria',
    },
    {
      id: 'barnacle-dime',
      mapName: 'Talerfisch & Pock',
    },
    {
      id: 'humpback-pump-track',
      mapName: 'Buckelwal-Piste',
    },
    {
      id: 'crableg-capital',
      mapName: 'Seespinnen-Skyline',
    },
    {
      id: 'shipshape-cargo-co',
      mapName: 'Frachtschiff Schwerfisch',
    },
    {
      id: 'robo-romen',
      mapName: 'ROM & RAMen',
    },
    {
      id: 'bluefin-depot',
      mapName: 'Blauflossen-Depot',
    },
    {
      id: 'marlin-airport',
      mapName: 'La Ola Airport',
    },
    {
      id: 'lemuria-hub',
      mapName: 'Bahnhof Lemuria',
    },
    {
      id: 'urchin-underpass',
      mapName: 'Dekabahnstation',
    },
  ]);
  availableModes: Mode[] = [
    {
      id: 'tw',
      name: 'Revierkampf',
    },
    {
      id: 'sz',
      name: 'Herrschaft',
    },
    {
      id: 'tc',
      name: 'Turm-Kommando',
    },
    {
      id: 'rm',
      name: 'Operation Goldfisch',
    },
    {
      id: 'cb',
      name: 'Muschelchaos',
    },
  ];
  availableDivisions: Division[] = [
    { id: 1, name: 'Division 1', color: '#FF0000' },
    { id: 2, name: 'Division 2', color: '#FF8800' },
    { id: 3, name: 'Division 3', color: '#FFFF00' },
    { id: 4, name: 'Division 4', color: '#00FF00' },
    { id: 5, name: 'Division 5', color: '#34AB53' },
    { id: 6, name: 'Division 6', color: '#0088FF' },
    { id: 7, name: 'Division 7', color: '#0400FF' },
    { id: 8, name: 'Division 8', color: '#730471' },
  ];

  /**
   * Available color data
   */
  matchColors: MatchColor[] = [
    { id: 0, colorAlpha: '#1516CE', colorBravo: '#FCAD24' },
    { id: 1, colorAlpha: '#C5DB39', colorBravo: '#832EFC' },
    { id: 2, colorAlpha: '#D6C712', colorBravo: '#4A1BFF' },
    { id: 3, colorAlpha: '#11BA9B', colorBravo: '#FE5735' },
    { id: 4, colorAlpha: '#0EB796', colorBravo: '#E93B71' },
    { id: 5, colorAlpha: '#E92C7E', colorBravo: '#1DA213' },
    { id: 6, colorAlpha: '#DEC11B', colorBravo: '#B826F3' },
    { id: 7, colorAlpha: '#9FD22F', colorBravo: '#CF2CB9' },
    { id: 8, colorAlpha: '#FC7E24', colorBravo: '#3F4AFD' },
    { id: 9, colorAlpha: '#F95D15', colorBravo: '#7D11D6' },
  ];
  colorLockColors: MatchColor[] = [
    { id: 0, colorAlpha: '#DBCA28', colorBravo: '#5533E1' },
    { id: 1, colorAlpha: '#F9AA22', colorBravo: '#165ADE' },
  ];

  /**
   * Main state
   */
  state: WritableSignal<BroadcastState> = signal<BroadcastState>({
    teamAlphaName: 'Team Alpha',
    teamBravoName: 'Team Bravo',
    alphaIsLeft: true,
    startTime: new Date(0),
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
    week: 1,
    currentColorsId: 0,
    colorLockActive: false,
  });

  loadInitialState(): void {
    const scope = this._log.beginScope('BroadcastStateService.loadInitialState');

    this._log.info('Loading initial broadcast state');

    this._api.getState().subscribe({
      next: (state) => {
        this._log.debug('Initial state received from API', state);

        this.state.set(state);

        this._log.info('Initial broadcast state applied');
      },
      error: (err) => {
        this._log.error('Failed to load initial state', err);
      },
    });

    scope.dispose();
  }

  update(partial: Partial<BroadcastState>): void {
    const scope = this._log.beginScope('BroadcastStateService.update');

    try {
      const before = this.state();

      const newState = {
        ...before,
        ...partial,
      };

      this._log.debug('Updating broadcast state', {
        before,
        patch: partial,
        after: newState,
      });

      this.state.set(newState);

      this._api.updateState(newState).subscribe({
        next: (result) => {
          this._log.info('Broadcast state updated via API', result);
        },
        error: (err) => {
          this._log.error('Failed to update broadcast state', err, newState);
        },
      });
    } finally {
      scope.dispose();
    }
  }

  addMap(): void {
    const scope = this._log.beginScope('BroadcastStateService.addMap');

    const state = this.state();
    const defaultMap = this.availableMaps()[0];
    const defaultMode = this.availableModes[1];

    const newMap = {
      id: crypto.randomUUID(),
      order: state.maps.length + 1,
      mapId: defaultMap.id,
      modeId: defaultMode.id,
      isVisible: true,
    };

    this._log.debug('Adding new map', newMap);

    this.update({
      maps: [...state.maps, newMap],
    });

    scope.dispose();
  }

  removeMap(id: string): void {
    const scope = this._log.beginScope('BroadcastStateService.removeMap');

    const state = this.state();

    this._log.debug('Removing map', { id });

    const maps = state.maps.filter((x) => x.id !== id);

    const reordered = maps.map((map, index) => ({
      ...map,
      order: index + 1,
    }));

    const scoreAlpha = reordered.filter((x) => x.winner === 'alpha').length;

    const scoreBravo = reordered.filter((x) => x.winner === 'bravo').length;

    this._log.debug('Maps reordered and scores recalculated', {
      scoreAlpha,
      scoreBravo,
      mapCount: reordered.length,
    });

    this.update({
      maps: reordered,
      scoreAlpha,
      scoreBravo,
    });

    scope.dispose();
  }
}
