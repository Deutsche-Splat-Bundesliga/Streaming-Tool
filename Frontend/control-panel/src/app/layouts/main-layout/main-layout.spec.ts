import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MainLayout } from './main-layout';
import { BroadcastStateService } from '../../services/broadcast-state';
import { SocialsService } from '../../services/socials';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';
import { LogService } from '../../services/log';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: '',
})
class MockSidebar {}

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: '',
})
class MockTopbar {}

// Remove this once marked-katex-extension import error is fixed
vi.mock('ngx-markdown', () => ({
  default: {},
}));
describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  const mockStateService = {
    loadInitialState: vi.fn(),
  };

  const mockSocialsService = {
    loadInitialState: vi.fn(),
  };

  const mockCommentatorBoxTimeDataService = {
    loadInitialState: vi.fn(),
  };

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
    vi.clearAllMocks();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        {
          provide: BroadcastStateService,
          useValue: mockStateService,
        },
        {
          provide: SocialsService,
          useValue: mockSocialsService,
        },
        {
          provide: CommentatorBoxTimeDataService,
          useValue: mockCommentatorBoxTimeDataService,
        },
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    })
      .overrideComponent(MainLayout, {
        set: {
          imports: [MockSidebar, MockTopbar, RouterOutlet],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadInitialState for BroadcastState on init', () => {
    expect(mockStateService.loadInitialState).toHaveBeenCalledOnce();
  });

  it('should call loadInitialState for Socials on init', () => {
    expect(mockSocialsService.loadInitialState).toHaveBeenCalledOnce();
  });
});
