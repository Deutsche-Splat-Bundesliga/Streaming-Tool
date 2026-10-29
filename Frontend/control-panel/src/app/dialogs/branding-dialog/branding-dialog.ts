import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslocoDirective } from '@jsverse/transloco';
import { Branding } from '../../models/branding';
import { BrandingService } from '../../services/branding';

type BrandingImageField = 'logoUrl' | 'largeLogoUrl' | 'outlineLogoUrl';

@Component({
  selector: 'app-branding-dialog',
  imports: [MatDialogModule, FormsModule, TranslocoDirective],
  templateUrl: './branding-dialog.html',
  styleUrl: './branding-dialog.scss',
})
export class BrandingDialog {
  private readonly _dialogRef = inject(MatDialogRef<BrandingDialog>);
  readonly brandingService = inject(BrandingService);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly draggingField = signal<BrandingImageField | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly imageFields: { key: BrandingImageField; label: string }[] = [
    { key: 'logoUrl', label: 'text.logo-url' },
    { key: 'largeLogoUrl', label: 'text.large-logo-url' },
    { key: 'outlineLogoUrl', label: 'text.outline-logo-url' },
  ];
  draft: Branding = { ...this.brandingService.branding() };
  private _dirty = false;

  constructor() {
    effect(() => {
      const current = this.brandingService.branding();
      if (!this._dirty) {
        this.draft = { ...current };
      }
    });
  }

  markDirty(): void {
    this._dirty = true;
  }

  handleDragOver(event: DragEvent, field: BrandingImageField): void {
    event.preventDefault();
    this.draggingField.set(field);
  }

  clearDraggingField(): void {
    this.draggingField.set(null);
  }

  handleDrop(event: DragEvent, field: BrandingImageField): void {
    event.preventDefault();
    this.clearDraggingField();
    const image = event.dataTransfer?.files.item(0);
    if (image) {
      this.uploadImage(image, field);
    }
  }

  handleFileSelection(event: Event, field: BrandingImageField): void {
    const input = event.currentTarget as HTMLInputElement;
    const image = input.files?.item(0);
    input.value = '';
    if (image) {
      this.uploadImage(image, field);
    }
  }

  save(): void {
    this.saving.set(true);
    this.brandingService.updateBranding(this.draft).subscribe({
      next: () => {
        this._dirty = false;
        this.saving.set(false);
        this._dialogRef.close();
      },
      error: () => this.saving.set(false),
    });
  }

  private uploadImage(image: File, field: BrandingImageField): void {
    if (this.uploading()) {
      return;
    }

    this.uploadError.set(null);
    this.uploading.set(true);

    this.brandingService.uploadAsset(image).subscribe({
      next: ({ assetUrl }) => {
        this.draft[field] = assetUrl;
        this.markDirty();
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set('text.image-upload-failed');
        this.uploading.set(false);
      },
    });
  }
}
