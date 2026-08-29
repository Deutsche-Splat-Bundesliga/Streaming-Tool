import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  imports: [MatDialogModule, FormsModule, TranslocoDirective],
  selector: 'app-settings-dialog',
  styleUrl: './settings-dialog.scss',
  templateUrl: './settings-dialog.html',
})
export class SettingsDialog {
  /**
   * Transloco service that handles translation settings
   */
  private _translocoService: TranslocoService = inject(TranslocoService);

  /**
   * Currently available languages, formatted as a string array
   */
  availableLanguages: string[] = this._translocoService.getAvailableLangs() as string[];

  /**
   * Currently active language
   */
  currentLanguage: string = this._translocoService.getActiveLang();

  /**
   *
   * @param language {string} New active language that got set by select
   */
  onLanguageChange(language: string): void {
    localStorage.setItem('currentLanguage', language);
    this._translocoService.setActiveLang(language);
  }
}
