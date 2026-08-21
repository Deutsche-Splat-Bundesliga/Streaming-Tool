import {
  afterNextRender,
  AfterRenderRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  WritableSignal,
} from '@angular/core';
import { BroadcastState } from '../../models/broadcast-state';
import { BroadcastStateService } from '../../services/broadcast-state';
import { ResizableText } from '../../features/resizable-text/resizable-text';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';

@Component({
  selector: 'start-screen',
  imports: [ResizableText],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.scss',
})
export class StartScreen implements OnInit, OnDestroy {
  /**
   * Injected logger for lifecycle and countdown diagnostics.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Scope for StartScreen overlay.
   */
  private readonly _scope: LogScope = this._log.beginScope('StartScreen');

  /**
   * Broadcast state service used to load and expose overlay state.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Current broadcast state signal for the start screen.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Active countdown timer handle, if one is currently running.
   */
  private _countdownInterval: ReturnType<typeof setInterval> | undefined = undefined;

  /**
   * Initializes the component and requests the initial broadcast state.
   */
  ngOnInit(): void {
    const scope = this._log.beginScope('StartScreen.ngOnInit');

    this._log.trace('StartScreen initialized');

    try {
      this._log.trace('Loading initial broadcast state');

      this.stateService.loadInitialState();

      this._log.debug('Broadcast state load requested');
    } catch (err) {
      this._log.error('Failed during StartScreen init', err);
    } finally {
      scope.dispose();
    }
  }

  /**
   * Render countdown timer content after every render when the DOM element is ready
   */
  private _afterNextRenderEffect: AfterRenderRef = afterNextRender(() => {
    const scope = this._log.beginScope('StartScreen._afterNextRenderEffect');

    try {
      this._log.info('Initializing countdown timer');

      clearInterval(this._countdownInterval);

      const setCountdownTimer = () => {
        const timerElem = document.body.querySelector('.countdown-timer');

        if (!timerElem) {
          this._log.trace('Countdown element not found yet');
          return;
        }

        const startTime = new Date(this.state().startTime);

        const diffTime = new Date(startTime.getTime() - Date.now());

        if (diffTime.getTime() <= 0) {
          timerElem.textContent = 'SOON™';
          return;
        }

        let hours = diffTime.getUTCHours().toString();
        let minutes = diffTime.getUTCMinutes().toString();
        let seconds = diffTime.getUTCSeconds().toString();

        hours = hours.length > 1 ? hours : '0' + hours;
        minutes = minutes.length > 1 ? minutes : '0' + minutes;
        seconds = seconds.length > 1 ? seconds : '0' + seconds;

        const formatted = hours + ':' + minutes + ':' + seconds;

        timerElem.textContent = formatted;

        this._log.trace('Countdown updated', {
          formatted,
        });
      };

      setCountdownTimer();

      this._countdownInterval = setInterval(setCountdownTimer, 1000);

      this._log.info('Countdown timer started');
    } catch (err) {
      this._log.error('Failed setting up countdown timer', err);
    } finally {
      scope.dispose();
    }
  });

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    clearInterval(this._countdownInterval);

    this._log.trace('Start Screen destroyed');
    this._scope.dispose();
    this._afterNextRenderEffect.destroy();
  }
}
