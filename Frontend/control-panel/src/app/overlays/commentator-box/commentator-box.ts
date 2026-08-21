import {
  Component,
  effect,
  EffectRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { BroadcastStateService } from '../../services/broadcast-state';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';
import { SocialsService } from '../../services/socials';
import { LogService } from '../../services/log';
import { Socials } from '../../models/socials';
import { CommentatorBoxTimeData } from '../../models/commentator-box-time-data';
import { BroadcastState } from '../../models/broadcast-state';
import { LogScope } from '../../models/log-scope';
import { CommBoxDisplayEvents } from '../../enums/comm-box-display-events';
import { SignalrEvents } from '../../services/signalr-events';
import { CommBoxDisplayMode } from '../../enums/comm-box-display-modes';

@Component({
  host: {
    '[class.hide-comm-box]': 'commBoxHidden()',
  },
  selector: 'app-commentator-box',
  imports: [],
  templateUrl: './commentator-box.html',
  styleUrl: './commentator-box.scss',
})
export class CommentatorBox implements OnInit, OnDestroy {
  /**
   * Whether the component is displayed on the score box
   */
  @Input() onScoreBox: boolean = false;

  /**
   * Signal indicating if the interval is hidden.
   */
  commBoxHidden: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Service for managing broadcast state.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);
  /**
   * Service for managing commentator box time data.
   */
  commentatorBoxTimeDataService: CommentatorBoxTimeDataService = inject(
    CommentatorBoxTimeDataService,
  );
  /**
   * Service for managing socials data.
   */
  socialsService: SocialsService = inject(SocialsService);

  /**
   * Current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Commentator box time configuration.
   */
  commentatorBoxTimeData: WritableSignal<CommentatorBoxTimeData> =
    this.commentatorBoxTimeDataService.commentatorBoxTimeData;

  /**
   * Socials data.
   */
  socials: WritableSignal<Socials> = this.socialsService.socials;

  /**
   * Service for logging
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Logging scope created for the CommentatorBox overlay.
   */
  private readonly _scope: LogScope = this._log.beginScope('CommentatorBox');

  /**
   * Timeout for hiding the display in manual mode.
   */
  private _manualHideDisplayTimeout: ReturnType<typeof setTimeout> | undefined;

  /**
   * Timeouts for hiding the display in auto mode.
   */
  private _autoHideDisplayTimeout: ReturnType<typeof setTimeout> | undefined;
  private _autoShowDisplayTimeout: ReturnType<typeof setTimeout> | undefined;

  /**
   * Instance for transmitting SignalrEvents
   */
  private _signalrEvents: SignalrEvents = inject(SignalrEvents);

  /**
   * Event for handling event listeners and clearing timeouts when the display mode switches
   */
  private _displayModeEffect: EffectRef = effect(() => {
    if (!this.onScoreBox) {
      this._displayModeEffect.destroy();
      return;
    }

    this.commBoxHidden.set(true);
    switch (this.commentatorBoxTimeData().displayMode) {
      case CommBoxDisplayMode.Manual:
        clearTimeout(this._autoHideDisplayTimeout);
        clearTimeout(this._autoShowDisplayTimeout);

        this._log.trace('Switched to comm box manual display mode, connecting event listeners');
        this.connectEventListeners();
        break;

      case CommBoxDisplayMode.Auto:
        clearTimeout(this._manualHideDisplayTimeout);

        this._log.trace('Switched to comm box auto display mode, disconnecting event listeners');
        this.disconnectEventListeners();
        break;

      default:
        this._log.warn('Invalid comm box display mode set!');
        break;
    }
  });

  /**
   * Updates and resets the commentator box effects
   */
  private _updateDisplayTimeouts: EffectRef = effect(() => {
    clearTimeout(this._autoHideDisplayTimeout);
    clearTimeout(this._autoShowDisplayTimeout);

    if (!this.onScoreBox) {
      this._updateDisplayTimeouts.destroy();
      return;
    }

    if (this.commentatorBoxTimeData().displayMode !== CommBoxDisplayMode.Auto) return;

    if (
      this.commentatorBoxTimeData().hideDisplayIntervalInSeconds === 0 ||
      this.commentatorBoxTimeData().showDisplayIntervalInSeconds === 0
    ) {
      this.commBoxHidden.set(false);
      return;
    }

    this._handleAutoShowInterval();
  });

  /**
   * Handles the interval when the display is currently shown and triggers timeout when it will get hidden again
   */
  private _handleAutoHideInterval(): void {
    this.commBoxHidden.set(false);
    this._autoHideDisplayTimeout = setTimeout(() => {
      this._handleAutoShowInterval();
    }, this.commentatorBoxTimeData().hideDisplayIntervalInSeconds * 1000);
  }

  /**
   * Handles the interval when the display is currently hidden and triggers timeout when it will get shown again
   */
  private _handleAutoShowInterval(): void {
    this.commBoxHidden.set(true);
    this._autoShowDisplayTimeout = setTimeout(() => {
      this._handleAutoHideInterval();
    }, this.commentatorBoxTimeData().showDisplayIntervalInSeconds * 1000);
  }

  /**
   * Handles the hide commentator box event that gets received from signalr event hub
   */
  handleHideEvent = () => {
    clearTimeout(this._manualHideDisplayTimeout);

    this._log.trace('Commentator box hide click event received, hiding comm box');
    this.commBoxHidden.set(true);
  };

  /**
   * Handles the show commentator box event that gets received from signalr event hub
   */
  handleShowEvent = () => {
    clearTimeout(this._manualHideDisplayTimeout);

    this._log.trace('Commentator box hide click event received, hiding comm box');
    this.commBoxHidden.set(false);
  };

  /**
   * Handles the show commentator box temporarily event that gets received from signalr event hub
   */
  handleShowTempEvent = () => {
    clearTimeout(this._manualHideDisplayTimeout);

    const hideIntervalInSeconds = this.commentatorBoxTimeData().hideDisplayIntervalInSeconds * 1000;
    this._log.trace('Commentator box show temporarily click event received, show comm box', {
      hideIntervalInSeconds: hideIntervalInSeconds,
    });

    this.commBoxHidden.set(false);
    this._manualHideDisplayTimeout = setTimeout(() => {
      this._log.trace('Interval finished, hiding comm box');
      this.commBoxHidden.set(true);
    }, hideIntervalInSeconds);
  };

  /**
   * Connect all signalr event listeners on component init
   */
  connectEventListeners(): void {
    this._signalrEvents.connection?.on(
      CommBoxDisplayEvents.CommBoxHideButtonClicked,
      this.handleHideEvent,
    );
    this._signalrEvents.connection?.on(
      CommBoxDisplayEvents.CommBoxShowButtonClicked,
      this.handleShowEvent,
    );
    this._signalrEvents.connection?.on(
      CommBoxDisplayEvents.CommBoxShowTempButtonClicked,
      this.handleShowTempEvent,
    );
  }

  /**
   * Disconnect all signalr event listeners on component destroy
   */
  disconnectEventListeners(): void {
    this._signalrEvents.connection?.off(CommBoxDisplayEvents.CommBoxHideButtonClicked);
    this._signalrEvents.connection?.off(CommBoxDisplayEvents.CommBoxShowButtonClicked);
    this._signalrEvents.connection?.off(CommBoxDisplayEvents.CommBoxShowTempButtonClicked);
  }

  /**
   * Initialize services and load initial state when the component is created.
   */
  ngOnInit(): void {
    this._log.trace('CommentatorBox initialized', {
      onScoreBox: this.onScoreBox,
    });

    if (this.onScoreBox) {
      this._log.trace(
        'CommentatorBox is on score box page, add Signalr EventHub listener for button click events',
      );
      this.connectEventListeners();
    }

    this.commBoxHidden.set(this.onScoreBox);

    this.stateService.loadInitialState();
    this.commentatorBoxTimeDataService.loadInitialState();
    this.socialsService.loadInitialState();
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    clearTimeout(this._manualHideDisplayTimeout);
    clearTimeout(this._autoHideDisplayTimeout);
    clearTimeout(this._autoShowDisplayTimeout);

    this._log.trace('CommentatorBox destroyed');
    this._scope.dispose();
    this.disconnectEventListeners();

    this._displayModeEffect.destroy();
  }
}
