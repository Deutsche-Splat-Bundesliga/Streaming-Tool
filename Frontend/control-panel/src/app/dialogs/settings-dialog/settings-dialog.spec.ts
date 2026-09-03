import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsDialog } from './settings-dialog';
import { getTranslocoModule } from '../../transloco-testing.module';

describe('SettingsDialog', () => {
  let component: SettingsDialog;
  let fixture: ComponentFixture<SettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsDialog, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
