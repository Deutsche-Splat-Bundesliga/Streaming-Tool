import { Component, EventEmitter, inject, OnDestroy, Output } from '@angular/core';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';

@Component({
  selector: 'app-toggle-slider',
  imports: [],
  templateUrl: './toggle-slider.html',
  styleUrl: './toggle-slider.scss',
})
export class ToggleSlider implements OnDestroy {
  /**
   * Logger instance for sidebar lifecycle and actions.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Scoped logger instance used for sidebar-specific logs.
   */
  private readonly _scope: LogScope = this._log.beginScope('Toggle Slider');

  /**
   * Event emitter output for click on toggle slider
   */
  @Output() onToggleSliderClick: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Handle click event on slider div and transmit it as an output on the html component
   * @param event {Event} Click event from div
   */
  handleToggleSliderClick(event?: Event): void {
    this._log.trace(
      'On toggle slider clicked! Transmitting event to onToggleSliderClick output...',
      event,
    );
    this.onToggleSliderClick.emit();
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('Toggle Slider component destroyed');
    this._scope.dispose();
  }
}
