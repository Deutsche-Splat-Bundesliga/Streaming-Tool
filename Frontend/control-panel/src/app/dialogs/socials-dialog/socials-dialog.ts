import { Component, inject, WritableSignal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { SocialsService } from '../../services/socials';
import { Socials } from '../../models/socials';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-socials-dialog',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './socials-dialog.html',
  styleUrl: './socials-dialog.scss',
})
export class SocialsDialog {
  /**
   * Service that manages social data for the sidebar.
   */
  socialsService: SocialsService = inject(SocialsService);

  /**
   * Writable signal representing the current social data.
   */
  socials: WritableSignal<Socials> = this.socialsService.socials;
}
