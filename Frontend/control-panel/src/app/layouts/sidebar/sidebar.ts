import { Component, inject, WritableSignal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BroadcastState } from '../../models/broadcast-state';
import { BroadcastStateService } from '../../services/broadcast-state';
import { CommentatorBoxTimeData } from '../../models/commentator-box-time-data';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { CommBoxDisplayEvents } from '../../enums/comm-box-display-events';
import { SignalrEvents } from '../../services/signalr-events';
import { CommBoxDisplayMode } from '../../enums/comm-box-display-modes';
import { ToggleSlider } from '../../features/toggle-slider/toggle-slider';
import { MatDialog } from '@angular/material/dialog';
import { ChangeColorsDialog } from '../../dialogs/change-colors-dialog/change-colors-dialog';
import { SocialsDialog } from '../../dialogs/socials-dialog/socials-dialog';
import { TourneySettingsDialog } from '../../dialogs/tourney-settings-dialog/tourney-settings-dialog';
import { StreamerCommsDialog } from '../../dialogs/streamer-comms-dialog/streamer-comms-dialog';
import { CommBoxSettingsDialog } from '../../dialogs/comm-box-settings-dialog/comm-box-settings-dialog';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, ToggleSlider],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  /**
   * Instance for transmitting SignalrEvents
   */
  private signalrEvents: SignalrEvents = inject(SignalrEvents);

  /**
   * Logger instance for sidebar lifecycle and actions.
   */
  private readonly log: LogService = inject(LogService);

  /**
   * Scoped logger instance used for sidebar-specific logs.
   */
  private readonly scope: LogScope = this.log.beginScope('Sidebar');

  /**
   * Dialog material instance that handles opening and closing of dialogs
   */
  private readonly dialog: MatDialog = inject(MatDialog);

  /**
   * Service that manages broadcast state and division data.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Service that manages commentator box time data.
   */
  commentatorBoxTimeDataService: CommentatorBoxTimeDataService = inject(
    CommentatorBoxTimeDataService,
  );

  /**
   * Writable signal representing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Writable signal representing the commentator box time data.
   */
  commentatorBoxTimeData: WritableSignal<CommentatorBoxTimeData> =
    this.commentatorBoxTimeDataService.commentatorBoxTimeData;

  /**
   * Handle click event for next color button that advances the current color id by one
   */
  handleNextColorButtonClick(): void {
    let currentColorsId = this.state().currentColorsId + 1;
    if (currentColorsId >= this.stateService.matchColors.length) {
      currentColorsId = 0;
    }

    this.log.trace('Updating match colors to next color in list', {
      previousColorsId: this.state().currentColorsId,
      currentColorsId,
    });
    this.stateService.update({ currentColorsId: currentColorsId });
  }

  /**
   * Handle click event for color settings button that opens the dialog
   */
  handleColorSettingsButtonClick(): void {
    this.dialog.closeAll();
    this.log.trace('Opening dialog for colors settings');
    this.dialog.open(ChangeColorsDialog, { panelClass: 'color-settings-dialog' });
  }

  /**
   * Handle click event for socials settings button that opens the dialog
   */
  handleSocialsSettingsButtonClick(): void {
    this.dialog.closeAll();
    this.log.trace('Opening dialog for socials settings');
    this.dialog.open(SocialsDialog, { panelClass: 'socials-dialog' });
  }

  /**
   * Handle click event for tourney settings button that opens the dialog
   */
  handleTourneySettingsButtonClick(): void {
    this.dialog.closeAll();
    this.log.trace('Opening dialog for tourney settings');
    this.dialog.open(TourneySettingsDialog, { panelClass: 'tourney-settings-dialog' });
  }

  /**
   * Handle click event for streamer and commentators button that opens the dialog
   */
  handleStreamerCommsButtonClick(): void {
    this.dialog.closeAll();
    this.log.trace('Opening dialog for setting streamer and commentators');
    this.dialog.open(StreamerCommsDialog, { panelClass: 'streamer-comms-dialog' });
  }

  /**
   * Handle click event for commentator box display settings button that opens the dialog
   */
  handleCommBoxSettingsButtonClick(): void {
    this.dialog.closeAll();
    this.log.trace('Opening dialog for commentator box display settings');
    this.dialog.open(CommBoxSettingsDialog, { panelClass: 'comm-box-settings-dialog' });
  }

  /**
   * Click event handling for the hide commentator box button
   */
  handleHideButtonClick(): void {
    this.log.trace('Firing click event for commentator box display button to Signalr EventHub', {
      type: CommBoxDisplayEvents.CommBoxHideButtonClicked,
    });
    this.signalrEvents.connection?.invoke(CommBoxDisplayEvents.CommBoxHideButtonClicked);
  }

  /**
   * Click event handling for the show commentator box button
   */
  handleShowButtonClick(): void {
    this.log.trace('Firing click event for commentator box display button to Signalr EventHub', {
      type: CommBoxDisplayEvents.CommBoxHideButtonClicked,
    });
    this.signalrEvents.connection?.invoke(CommBoxDisplayEvents.CommBoxShowButtonClicked);
  }

  /**
   * Click event handling for the show commentator box temporarily button
   */
  handleShowTempButtonClick(): void {
    this.log.trace('Firing click event for commentator box display button to Signalr EventHub', {
      type: CommBoxDisplayEvents.CommBoxHideButtonClicked,
    });
    this.signalrEvents.connection?.invoke(CommBoxDisplayEvents.CommBoxShowTempButtonClicked);
  }

  /**
   * Initialize the sidebar and load initial service state.
   * @returns void
   */
  ngOnInit(): void {
    this.log.info('Sidebar initializing');

    try {
      this.stateService.loadInitialState();
      this.commentatorBoxTimeDataService.loadInitialState();

      this.log.debug('Initial state load triggered', {
        hasStateService: !!this.stateService,
        hasTimeDataService: !!this.commentatorBoxTimeDataService,
      });
    } catch (err) {
      this.log.error('Sidebar initialization failed', err);
    }
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   * @returns void
   */
  ngOnDestroy(): void {
    this.log.trace('Sidebar destroyed');
    this.scope.dispose();
  }

  /**
   * Getter that returns property of `CommBoxDisplayMode` type to access enum on HTML
   */
  get commBoxDisplayMode(): typeof CommBoxDisplayMode {
    return CommBoxDisplayMode;
  }
}
