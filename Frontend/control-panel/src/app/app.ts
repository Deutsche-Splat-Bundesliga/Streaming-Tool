import {
  Component,
  signal,
  afterRenderEffect,
  inject,
  NgZone,
  WritableSignal,
  OnDestroy,
  afterEveryRender,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BroadcastState } from './models/broadcast-state';
import { BroadcastStateService } from './services/broadcast-state';
import { SocialsService } from './services/socials';
import { Socials } from './models/socials';
import { CommentatorBoxTimeDataService } from './services/commentator-box-time-data';
import { CommentatorBoxTimeData } from './models/commentator-box-time-data';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly title = signal('control-panel');

  /**
   * Transloco service that handles translation settings
   */
  private _translocoService: TranslocoService = inject(TranslocoService);

  /**
   * Injects the `BroadcastStateService` to access the current broadcast state and available maps, modes, and divisions. The `state` signal is used to reactively track changes to the broadcast state, allowing the score box component to update its UI accordingly whenever the state changes. This setup enables the score box to display the current team names and scores based on the latest broadcast state received from the service.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Injects the `SocialsService` to access social links such as discord server invite, twitter handle, etc. The `socials` signal is used to reactively track changes to the socials state to update the overlay accordingly
   */
  socialsService: SocialsService = inject(SocialsService);

  /**
   * Injects the `CommentatorBoxTimeDataService` to access the display and hide times for the commentator box on the map screen overlay
   */
  commentatorBoxTimeDataService: CommentatorBoxTimeDataService = inject(
    CommentatorBoxTimeDataService,
  );

  /**
   * Injects `NgZone` to run DOM manipulations outside of Angular's change detection zone.
   * This prevents ExpressionChangedAfterItHasBeenCheckedError when updating CSS properties.
   */
  ngZone: NgZone = inject(NgZone);

  /**
   * A writable signal that holds the current broadcast state. It is initialized by referencing the `state` signal from the `BroadcastStateService`, allowing the map screen display component to reactively update its UI whenever the broadcast state changes. This signal is used to display the current map information in the map screen display, ensuring that it always reflects the most current state of the broadcast as provided by the service.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * A writable signal that holds the current socials state. It is initialized by referencing the `socials` signal from the `SocialsService`, allowing the end screen display component to reactively update its UI whenever the socials state changes.
   */
  socials: WritableSignal<Socials> = this.socialsService.socials;

  /**
   * A writable signal the holds the current commentator box time data state. It is initialized by referencing the `commentatorBoxTimeData` signal from the `CommentatorBoxTimeDataService`, allowing the display times for the commentator box to be updated reactively
   */
  commentatorBoxTimeData: WritableSignal<CommentatorBoxTimeData> =
    this.commentatorBoxTimeDataService.commentatorBoxTimeData;

  /**
   * Effect that watches for division changes and updates the CSS custom property
   * `--current-division-color` to match the corresponding division color variable.
   * This ensures the header background gradient always reflects the current division's color scheme.
   */
  private _divisionColorEffect = afterRenderEffect(() => {
    const currentDivision = this.stateService.availableDivisions.find(
      (div) => div.id === this.state().division,
    );
    if (!currentDivision) return;

    document.documentElement.style.setProperty('--current-division-color', currentDivision.color);
  });

  /**
   * Effect that watches for match color changes and updates our custom CSS properties
   * `--team-alpha-color` is the color variable for the currently active team alpha color
   * `--team-bravo-color` is the color variable for the currently active team bravo color
   * This ensures the current team ink colors always reflect the current match colors
   */
  private _matchColorsEffect = afterRenderEffect(() => {
    const currentColorsId = this.state().currentColorsId;
    const currentColors = this.state().colorLockActive
      ? this.stateService.colorLockColors
      : this.stateService.matchColors;

    if (currentColorsId === null || !currentColors) return;

    document.documentElement.style.setProperty(
      '--team-alpha-color',
      currentColors[currentColorsId].colorAlpha,
    );
    document.documentElement.style.setProperty(
      '--team-bravo-color',
      currentColors[currentColorsId].colorBravo,
    );
  });

  /**
   * Effect that fires after every page render to get the last selected active language from local storage and to set it in transloco
   */
  private _currentLanguageEffect = afterEveryRender(() => {
    const currentLanguage = localStorage.getItem('currentLanguage');
    if (currentLanguage) {
      this._translocoService.setActiveLang(currentLanguage);
    }
  });

  /**
   * Destroys all effects on component destroy
   */
  ngOnDestroy(): void {
    this._divisionColorEffect.destroy();
    this._matchColorsEffect.destroy();
    this._currentLanguageEffect.destroy();
  }
}
