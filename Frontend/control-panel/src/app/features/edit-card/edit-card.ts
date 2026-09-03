import {
  Component,
  EventEmitter,
  Output,
  inject,
  OnDestroy,
  OnInit,
  WritableSignal,
} from '@angular/core';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { TranslocoDirective } from '@jsverse/transloco';
import { Mode } from '../../models/mode';
import { BroadcastStateService } from '../../services/broadcast-state';

@Component({
  selector: 'app-edit-card',
  imports: [TranslocoDirective],
  templateUrl: './edit-card.html',
  styleUrl: './edit-card.scss',
})
export class EditCard implements OnInit, OnDestroy {
  /**
   * Local logger instance for edit card operations.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Logging scope for this component lifecycle and actions.
   */
  private readonly _scope: LogScope = this._log.beginScope('EditCard');

  /**
   * Service managing broadcast state updates.
   */
  private _stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Event emitter triggered when the close button of the edit card is clicked.
   */
  @Output() onCloseClick: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitter triggered when the mode selection is changed.
   */
  @Output() onModeChange: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Event emitter triggered when the delete action is initiated.
   */
  @Output() onDeleteMap: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Signal for available modes with translations
   */
  availableModes: WritableSignal<Mode[]> = this._stateService.availableModes;

  /**
   * Angular lifecycle hook called when the component is initialized.
   */
  ngOnInit(): void {
    this._log.info('EditCard initialized');
  }

  /**
   * Close the edit menu and emit the close event.
   */
  closeEditMenu(): void {
    this._log.debug('Close edit menu clicked');

    this.onCloseClick.emit();

    this._log.trace('Close event emitted');
  }

  /**
   * Change the edit mode and close the menu.
   * @param mode {string} The new mode to select.
   */
  changeMode(mode: string): void {
    this._log.info('Mode change triggered', { mode });

    this.onModeChange.emit(mode);
    this.onCloseClick.emit();

    this._log.debug('Mode change + close emitted', { mode });
  }

  /**
   * Emit the delete map action when the user confirms deletion.
   */
  deleteMap(): void {
    this._log.warn('Delete map triggered');

    this.onDeleteMap.emit();

    this._log.trace('Delete event emitted');
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('EditCard destroyed');
    this._scope.dispose();
  }
}
