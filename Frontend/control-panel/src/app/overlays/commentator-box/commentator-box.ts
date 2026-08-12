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
  private readonly log: LogService = inject(LogService);

  /**
   * Logging scope created for the CommentatorBox overlay.
   */
  private readonly scope: LogScope = this.log.beginScope('CommentatorBox');

  /**
   * Timeout for hiding the display in manual mode.
   */
  private manualHideDisplayTimeout: ReturnType<typeof setTimeout> | undefined;

  /**
   * Timeouts for hiding the display in auto mode.
   */
  private autoHideDisplayTimeout: ReturnType<typeof setTimeout> | undefined;
  private autoShowDisplayTimeout: ReturnType<typeof setTimeout> | undefined;

  /**
   * Instance for transmitting SignalrEvents
   */
  private signalrEvents: SignalrEvents = inject(SignalrEvents);

  /**
   * Event for handling event listeners and clearing timeouts when the display mode switches
   */
  private displayModeEffect: EffectRef = effect(() => {
    if (!this.onScoreBox) {
      this.displayModeEffect.destroy();
      return;
    }

    this.commBoxHidden.set(true);
    switch (this.commentatorBoxTimeData().displayMode) {
      case CommBoxDisplayMode.Manual:
        clearTimeout(this.autoHideDisplayTimeout);
        clearTimeout(this.autoShowDisplayTimeout);

        this.log.trace('Switched to comm box manual display mode, connecting event listeners');
        this.connectEventListeners();
        break;

      case CommBoxDisplayMode.Auto:
        clearTimeout(this.manualHideDisplayTimeout);

        this.log.trace('Switched to comm box auto display mode, disconnecting event listeners');
        this.disconnectEventListeners();
        break;

      default:
        this.log.warn('Invalid comm box display mode set!');
        break;
    }
  });

  /**
   * Updates and resets the commentator box effects
   */
  private updateDisplayTimeouts: EffectRef = effect(() => {
    clearTimeout(this.autoHideDisplayTimeout);
    clearTimeout(this.autoShowDisplayTimeout);

    if (!this.onScoreBox) {
      this.updateDisplayTimeouts.destroy();
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

    this.handleAutoShowInterval();
  });

  /**
   * Handles the interval when the display is currently shown and triggers timeout when it will get hidden again
   */
  private handleAutoHideInterval(): void {
    this.commBoxHidden.set(false);
    this.autoHideDisplayTimeout = setTimeout(() => {
      this.handleAutoShowInterval();
    }, this.commentatorBoxTimeData().hideDisplayIntervalInSeconds * 1000);
  }

  /**
   * Handles the interval when the display is currently hidden and triggers timeout when it will get shown again
   */
  private handleAutoShowInterval(): void {
    this.commBoxHidden.set(true);
    this.autoShowDisplayTimeout = setTimeout(() => {
      this.handleAutoHideInterval();
    }, this.commentatorBoxTimeData().showDisplayIntervalInSeconds * 1000);
  }

  /**
   * Handles the hide commentator box event that gets received from signalr event hub
   */
  handleHideEvent = () => {
    clearTimeout(this.manualHideDisplayTimeout);

    this.log.trace('Commentator box hide click event received, hiding comm box');
    this.commBoxHidden.set(true);
  };

  /**
   * Handles the show commentator box event that gets received from signalr event hub
   */
  handleShowEvent = () => {
    clearTimeout(this.manualHideDisplayTimeout);

    this.log.trace('Commentator box hide click event received, hiding comm box');
    this.commBoxHidden.set(false);
  };

  /**
   * Handles the show commentator box temporarily event that gets received from signalr event hub
   */
  handleShowTempEvent = () => {
    clearTimeout(this.manualHideDisplayTimeout);

    const hideIntervalInSeconds = this.commentatorBoxTimeData().hideDisplayIntervalInSeconds * 1000;
    this.log.trace('Commentator box show temporarily click event received, show comm box', {
      hideIntervalInSeconds: hideIntervalInSeconds,
    });

    this.commBoxHidden.set(false);
    this.manualHideDisplayTimeout = setTimeout(() => {
      this.log.trace('Interval finished, hiding comm box');
      this.commBoxHidden.set(true);
    }, hideIntervalInSeconds);
  };

  /**
   * Connect all signalr event listeners on component init
   */
  connectEventListeners(): void {
    this.signalrEvents.connection?.on(
      CommBoxDisplayEvents.CommBoxHideButtonClicked,
      this.handleHideEvent,
    );
    this.signalrEvents.connection?.on(
      CommBoxDisplayEvents.CommBoxShowButtonClicked,
      this.handleShowEvent,
    );
    this.signalrEvents.connection?.on(
      CommBoxDisplayEvents.CommBoxShowTempButtonClicked,
      this.handleShowTempEvent,
    );
  }

  /**
   * Disconnect all signalr event listeners on component destroy
   */
  disconnectEventListeners(): void {
    this.signalrEvents.connection?.off(CommBoxDisplayEvents.CommBoxHideButtonClicked);
    this.signalrEvents.connection?.off(CommBoxDisplayEvents.CommBoxShowButtonClicked);
    this.signalrEvents.connection?.off(CommBoxDisplayEvents.CommBoxShowTempButtonClicked);
  }

  /**
   * Initialize services and load initial state when the component is created.
   */
  ngOnInit(): void {
    this.log.trace('CommentatorBox initialized', {
      onScoreBox: this.onScoreBox,
    });

    if (this.onScoreBox) {
      this.log.trace(
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
    clearTimeout(this.manualHideDisplayTimeout);
    clearTimeout(this.autoHideDisplayTimeout);
    clearTimeout(this.autoShowDisplayTimeout);

    this.log.trace('CommentatorBox destroyed');
    this.scope.dispose();
    this.disconnectEventListeners();

    this.displayModeEffect.destroy();
  }
}
