import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditCard } from './edit-card';
import { LogService } from '../../services/log';
import { getTranslocoModule } from '../../transloco-testing.module';

describe('EditCard', () => {
  let component: EditCard;
  let fixture: ComponentFixture<EditCard>;

  const mockLogService = {
    beginScope: vi.fn().mockReturnValue({
      dispose: vi.fn(),
    }),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [EditCard, getTranslocoModule()],
      providers: [
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    })
      .overrideComponent(EditCard, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onCloseClick when closeEditMenu is called', () => {
    const emitSpy = vi.spyOn(component.onCloseClick, 'emit');

    component.closeEditMenu();

    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it('should emit selected mode when changeMode is called', () => {
    const emitSpy = vi.spyOn(component.onModeChange, 'emit');

    component.changeMode('tc');

    expect(emitSpy).toHaveBeenCalledWith('tc');
  });

  it('should emit onDeleteMap when deleteMap is called', () => {
    const emitSpy = vi.spyOn(component.onDeleteMap, 'emit');

    component.deleteMap();

    expect(emitSpy).toHaveBeenCalledOnce();
  });
});
