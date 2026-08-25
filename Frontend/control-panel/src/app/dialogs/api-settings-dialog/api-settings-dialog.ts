import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ApiManagementService } from '../../services/api-management';
import { ApiKey } from '../../models/api-key';
import { ApiKeyCreated } from '../../models/api-key-created';
import { ApiKeyAccessLevel } from '../../enums/api-key-access-level';
import { ToggleSlider } from '../../features/toggle-slider/toggle-slider';
import { LogService } from '../../services/log';

/**
 * Dialog for configuring the public REST API: toggling authentication,
 * issuing and revoking API keys, and watching the live API request log.
 */
@Component({
  selector: 'app-api-settings-dialog',
  imports: [MatDialogModule, FormsModule, ToggleSlider, DatePipe],
  templateUrl: './api-settings-dialog.html',
  styleUrl: './api-settings-dialog.scss',
})
export class ApiSettingsDialog implements OnInit {
  private readonly _log: LogService = inject(LogService);

  /**
   * Service managing API settings, keys and the live request log.
   */
  apiService: ApiManagementService = inject(ApiManagementService);

  /**
   * The name entered for a new API key.
   */
  newKeyName: WritableSignal<string> = signal<string>('');

  /**
   * The access level selected for a new API key.
   */
  newKeyAccessLevel: WritableSignal<number> = signal<number>(ApiKeyAccessLevel.ReadWrite);

  /**
   * The plaintext key that was just created, shown exactly once, or null.
   */
  createdKey: WritableSignal<ApiKeyCreated | null> = signal<ApiKeyCreated | null>(null);

  /**
   * Whether the just-created key was copied to the clipboard.
   */
  copied: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * The live API request log, newest entries last, reversed for newest-first display.
   */
  reversedLog = computed(() => [...this.apiService.log$()].reverse());

  /**
   * Loads the current API management state when the dialog opens.
   */
  ngOnInit(): void {
    this.apiService.loadInitialState();
  }

  /**
   * Toggles whether unauthenticated API requests are allowed.
   */
  toggleAllowUnauthenticated(): void {
    this.apiService.setAllowUnauthenticatedRequests(
      !this.apiService.settings().allowUnauthenticatedRequests,
    );
  }

  /**
   * Creates a new API key from the current form values.
   */
  createKey(): void {
    const name = this.newKeyName().trim();

    if (!name) {
      this._log.warn('Cannot create API key without a name');
      return;
    }

    this.apiService.createKey(name, this.newKeyAccessLevel()).subscribe({
      next: (created) => {
        this.createdKey.set(created);
        this.copied.set(false);
        this.newKeyName.set('');
      },
      error: (err) => this._log.error('Failed to create API key', err),
    });
  }

  /**
   * Copies the just-created plaintext key to the clipboard.
   */
  async copyCreatedKey(): Promise<void> {
    const created = this.createdKey();

    if (!created) return;

    try {
      await navigator.clipboard.writeText(created.key);
      this.copied.set(true);
    } catch (err) {
      this._log.error('Failed to copy API key to clipboard', err);
    }
  }

  /**
   * Dismisses the one-time reveal of the created key.
   */
  dismissCreatedKey(): void {
    this.createdKey.set(null);
    this.copied.set(false);
  }

  /**
   * Revokes (deletes) an API key.
   */
  revokeKey(key: ApiKey): void {
    this.apiService.deleteKey(key.id);
  }

  /**
   * Clears the API request log.
   */
  clearLog(): void {
    this.apiService.clearLog();
  }

  /**
   * Returns a human-readable label for the given access level.
   */
  accessLevelLabel(accessLevel: number): string {
    return accessLevel === ApiKeyAccessLevel.ReadOnly ? 'Nur Lesen' : 'Lesen & Schreiben';
  }

  /**
   * Getter exposing the access level enum to the template.
   */
  get accessLevel(): typeof ApiKeyAccessLevel {
    return ApiKeyAccessLevel;
  }
}
